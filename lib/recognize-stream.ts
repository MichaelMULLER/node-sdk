/**
 * (C) Copyright IBM Corp. 2014, 2019.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */

import extend = require('extend');
import { contentType, qs } from 'ibm-cloud-sdk-core';
import omit = require('object.omit');
import pick = require('object.pick');
import { Duplex } from 'stream';
import websocket = require ('websocket');

const w3cWebSocket = websocket.w3cwebsocket;

const OPENING_MESSAGE_PARAMS_ALLOWED = [
  'action',
  'customization_weight',
  'processing_metrics',
  'processing_metrics_interval',
  'audio_metrics',
  'inactivity_timeout',
  'timestamps',
  'word_confidence',
  'content-type',
  'interim_results',
  'keywords',
  'keywords_threshold',
  'max_alternatives',
  'word_alternatives_threshold',
  'profanity_filter',
  'smart_formatting',
  'speaker_labels',
  'grammar_name',
  'redaction',
];

const QUERY_PARAMS_ALLOWED = [
  'model',
  'X-Watson-Learning-Opt-Out',
  'watson-token',
  'language_customization_id',
  'customization_id',
  'acoustic_customization_id',
  'access_token',
  'base_model_version',
  'x-watson-metadata',
];

interface RecognizeStream extends Duplex {
  _writableState;
  readableObjectMode;
}

/**
 * pipe()-able Node.js Readable/Writeable stream - accepts binary audio and emits text in its `data` events.
 * Also emits `results` events with interim results and other data.
 *
 * Cannot be instantiated directly, instead created by calling #recognizeUsingWebSocket()
 *
 * Uses WebSockets under the hood. For audio with no recognizable speech, no `data` events are emitted.
 * @param {Object} options
 * @constructor
 */
class RecognizeStream extends Duplex {
  static WEBSOCKET_CONNECTION_ERROR: string = 'WebSocket connection error';
  static ERROR_UNRECOGNIZED_FORMAT: string = 'UNRECOGNIZED_FORMAT';

  static getContentType(buffer: Buffer): string {
    // the substr really shouldn't be necessary, but there's a bug somewhere that can cause buffer.slice(0,4) to return
    // the entire contents of the buffer, so it's a failsafe to catch that
    return contentType.fromHeader(buffer);
  }

  private options;
  private listening: boolean;
  private initialized: boolean;
  private finished: boolean;
  private socket;

  /**
   * pipe()-able Node.js Duplex stream - accepts binary audio and emits text/objects in it's `data` events.
   *
   * Uses WebSockets under the hood. For audio with no recognizable speech, no `data` events are emitted.
   *
   * By default, only finalized text is emitted in the data events, however when `objectMode`/`readableObjectMode` and `interim_results` are enabled, both interim and final results objects are emitted.
   * WriteableElementStream uses this, for example, to live-update the DOM with word-by-word transcriptions.
   *
   * Note that the WebSocket connection is not established until the first chunk of data is recieved. This allows for auto-detection of content type (for wav/flac/opus audio).
   *
   * @param {Object} options
   * @param {String} [options.model='en-US_BroadbandModel'] - voice model to use. Microphone streaming only supports broadband models.
   * @param {String} [options.url='wss://stream.watsonplatform.net/speech-to-text/api'] base URL for service
   * @param {String} [options.token] - Auth token
   * @param {String} [options.access_token] - IAM auth token
   * @param {Object} [options.headers] - Only works in Node.js, not in browsers. Allows for custom headers to be set, including an Authorization header (preventing the need for auth tokens)
   * @param {String} [options.content-type='audio/wav'] - content type of audio; can be automatically determined from file header in most cases. only wav, flac, ogg/opus, and webm are supported
   * @param {Boolean} [options.interim_results=false] - Send back non-final previews of each "sentence" as it is being processed. These results are ignored in text mode.
   * @param {Boolean} [options.word_confidence=false] - include confidence scores with results.
   * @param {Boolean} [options.timestamps=false] - include timestamps with results.
   * @param {Number} [options.max_alternatives=1] - maximum number of alternative transcriptions to include.
   * @param {Array<String>} [options.keywords] - a list of keywords to search for in the audio
   * @param {Number} [options.keywords_threshold] - Number between 0 and 1 representing the minimum confidence before including a keyword in the results. Required when options.keywords is set
   * @param {Number} [options.word_alternatives_threshold] - Number between 0 and 1 representing the minimum confidence before including an alternative word in the results. Must be set to enable word alternatives,
   * @param {Boolean} [options.profanity_filter=false] - set to true to filter out profanity and replace the words with *'s
   * @param {Number} [options.inactivity_timeout=30] - how many seconds of silence before automatically closing the stream. use -1 for infinity
   * @param {Boolean} [options.readableObjectMode=false] - emit `result` objects instead of string Buffers for the `data` events. Does not affect input (which must be binary)
   * @param {Boolean} [options.objectMode=false] - alias for options.readableObjectMode
   * @param {Number} [options.X-Watson-Learning-Opt-Out=false] - set to true to opt-out of allowing Watson to use this request to improve it's services
   * @param {Boolean} [options.smart_formatting=false] - formats numeric values such as dates, times, currency, etc.
   * @param {String} [options.language_customization_id] - Language customization ID
   * @param {String} [options.customization_id] - Customization ID (DEPRECATED)
   * @param {String} [options.acoustic_customization_id] - Acoustic customization ID
   * @param {IamTokenManagerV1} [options.token_manager] - Token manager for authenticating with IAM
   * @param {string} [options.base_model_version] - The version of the specified base model that is to be used with recognition request or, for the **Create a session** method, with the new session.
   * Multiple versions of a base model can exist when a model is updated for internal improvements. The parameter is intended primarily for use with custom models that have been upgraded for a new base model.
   * The default value depends on whether the parameter is used with or without a custom model. For more information, see [Base model version](https://cloud.ibm.com/docs/services/speech-to-text?topic=speech-to-text-input#version).
   * @param {Boolean} [options.rejectUnauthorized] - If true, disable SSL verification for the WebSocket connection
   * @param {String} [options.grammar_name] - The name of a grammar that is to be used with the recognition request. If you specify a grammar, you must also use the `language_customization_id` parameter to specify the name of the custom language model for which the grammar is defined. The service recognizes only strings that are recognized by the specified grammar; it does not recognize other custom words from the model's words resource. See [Grammars](https://cloud.ibm.com/docs/services/speech-to-text/output.html)
   * @param {Boolean} [options.redaction] - If `true`, the service redacts, or masks, numeric data from final transcripts. The feature redacts any number that has three or more consecutive digits by replacing each digit with an `X` character. It is intended to redact sensitive numeric data, such as credit card numbers. By default, the service performs no redaction. When you enable redaction, the service automatically enables smart formatting, regardless of whether you explicitly disable that feature. To ensure maximum security, the service also disables keyword spotting (ignores the `keywords` and `keywords_threshold` parameters) and returns only a single final transcript (forces the `max_alternatives` parameter to be `1`). **Note:** Applies to US English, Japanese, and Korean transcription only. See [Numeric redaction](https://cloud.ibm.com/docs/services/speech-to-text/output.html#redaction)
   *
   * @constructor
   */
  constructor(options) {
    // this stream only supports objectMode on the output side.
    // It must receive binary data input.
    if (options.objectMode) {
      options.readableObjectMode = true;
      delete options.objectMode;
    }
    super(options);
    if (options.readableObjectMode && this.readableObjectMode === undefined) {
      this.readableObjectMode = true;
    }
    this.options = options;
    this.listening = false;
    this.initialized = false;
    this.finished = false;

    this.on('newListener', event => {
      if (!options.silent) {
        if (
          event === 'results' ||
          event === 'result' ||
          event === 'speaker_labels'
        ) {
          // eslint-disable-next-line no-console
          console.log(
            new Error(
              'Watson Speech to Text RecognizeStream: the ' +
                event +
                ' event was deprecated. ' +
                "Please set {objectMode: true} and listen for the 'data' event instead. " +
                'Pass {silent: true} to disable this message.'
            )
          );
        } else if (event === 'connection-close') {
          // eslint-disable-next-line no-console
          console.log(
            new Error(
              'Watson Speech to Text RecognizeStream: the ' +
                event +
                ' event was deprecated. ' +
                "Please listen for the 'close' event instead. " +
                'Pass {silent: true} to disable this message.'
            )
          );
        } else if (event === 'connect') {
          // eslint-disable-next-line no-console
          console.log(
            new Error(
              'Watson Speech to Text RecognizeStream: the ' +
                event +
                ' event was deprecated. ' +
                "Please listen for the 'open' event instead. " +
                'Pass {silent: true} to disable this message.'
            )
          );
        }
      }
    });
  }

  initialize() {
    const options = this.options;

    if (options.token && !options['watson-token']) {
      console.warn(
        'Authenticating with the X-Watson-Authorization-Token header or the `watson-token` query param is deprecated.' +
        ' The token continues to work with Cloud Foundry services, but is not' +
        ' supported for services that use Identity and Access Management (IAM) authentication.' +
        ' For details see Authenticating with IAM tokens or the README in the IBM Watson SDK you use.'
      );
      options['watson-token'] = options.token;
    }
    if (options.content_type && !options['content-type']) {
      options['content-type'] = options.content_type;
    }
    if (options['X-WDC-PL-OPT-OUT'] && !options['X-Watson-Learning-Opt-Out']) {
      options['X-Watson-Learning-Opt-Out'] = options['X-WDC-PL-OPT-OUT'];
    }

    // compatibility code for the deprecated param, customization_id
    if (options.customization_id && !options.language_customization_id) {
      options.language_customization_id = options.customization_id;
      delete options.customization_id;
    }

    const queryParams = extend(
      'language_customization_id' in options
        ? pick(options, QUERY_PARAMS_ALLOWED)
        : { model: 'en-US_BroadbandModel' },
      pick(options, QUERY_PARAMS_ALLOWED)
    );

    const queryString = qs.stringify(queryParams);
    const url =
      (options.url || 'wss://stream.watsonplatform.net/speech-to-text/api'
      ).replace(/^http/, 'ws') +
      '/v1/recognize?' +
      queryString;

    const openingMessage = pick(options, OPENING_MESSAGE_PARAMS_ALLOWED);
    openingMessage.action = 'start';

    const self = this;

    // node params: requestUrl, protocols, origin, headers, extraRequestOptions, clientConfig options
    // browser params: requestUrl, protocols (all others ignored)

    // for the last argument, `tlsOptions` gets passed to Node's `http` library,
    // which allows us to pass a rejectUnauthorized option
    // for disabling SSL verification (for ICP)
    const socket = (this.socket = new w3cWebSocket(
      url,
      null,
      null,
      options.headers,
      null,
      { tlsOptions: { rejectUnauthorized: options.rejectUnauthorized }}
    ));

    // when the input stops, let the service know that we're done
    self.on('finish', self.finish.bind(self));

    /**
     * This can happen if the credentials are invalid - in that case, the response from DataPower doesn't include the
     * necessary CORS headers, so JS can't even read it :(
     *
     * @param {Event} event - event object with essentially no useful information
     */
    socket.onerror = (event) => {
      self.listening = false;
      const err = new Error('WebSocket connection error');
      err.name = RecognizeStream.WEBSOCKET_CONNECTION_ERROR;
      err['event'] = event;
      self.emit('error', err);
      self.push(null);
    };

    this.socket.onopen = () => {
      self.sendJSON(openingMessage);
      /**
       * emitted once the WebSocket connection has been established
       * @event RecognizeStream#open
       */
      self.emit('open');
    };

    this.socket.onclose = (e) => {
      self.listening = false;
      self.push(null);
      /**
       * @event RecognizeStream#close
       * @param {Number} reasonCode
       * @param {String} description
       */
      self.emit('close', e.code, e.reason);
    };

    /**
     * @event RecognizeStream#error
     * @param {String} msg custom error message
     * @param {*} [frame] unprocessed frame (should have a .data property with either string or binary data)
     * @param {Error} [err]
     */
    function emitError(msg, frame, err?) {
      if (err) {
        err.message = msg + ' ' + err.message;
      } else {
        err = new Error(msg);
      }
      err.raw = frame;
      self.emit('error', err);
    }

    socket.onmessage = (frame) => {
      if (typeof frame.data !== 'string') {
        return emitError('Unexpected binary data received from server', frame);
      }

      let data;
      try {
        data = JSON.parse(frame.data);
      } catch (jsonEx) {
        return emitError('Invalid JSON received from service:', frame, jsonEx);
      }

      /**
       * Emit any messages received over the wire, mainly used for debugging.
       *
       * @event RecognizeStream#message
       * @param {Object} message - frame object with a data attribute that's either a string or a Buffer/TypedArray
       * @param {Object} [data] - parsed JSON object (if possible);
       */
      self.emit('message', frame, data);

      if (data.error) {
        emitError(data.error, frame);
      } else if (data.state === 'listening') {
        // this is emitted both when the server is ready for audio, and after we send the close message to indicate that it's done processing
        if (self.listening) {
          self.listening = false;
          socket.close();
        } else {
          self.listening = true;
          /**
           * Emitted when the Watson Service indicates readiness to transcribe audio. Any audio sent before this point will be buffered until now.
           * @event RecognizeStream#listening
           */
          self.emit('listening');
        }
      } else {
        if (options.readableObjectMode) {
          /**
           * Object with interim or final results, possibly including confidence scores, alternatives, and word timing.
           * @event RecognizeStream#data
           * @param {Object} data
           */
          self.push(data);
        } else if (Array.isArray(data.results)) {
          data.results.forEach((result) => {
            if (result.final && result.alternatives) {
              /**
               * Finalized text
               * @event RecognizeStream#data
               * @param {String} transcript
               */
              self.push(result.alternatives[0].transcript, 'utf8');
            }
          });
        }
      }
    };

    this.initialized = true;
  }

  sendJSON(msg): void {
    /**
     * Emits any JSON object sent to the service from the client. Mainly used for debugging.
     * @event RecognizeStream#send-json
     * @param {Object} msg
     */
    this.emit('send-json', msg);
    return this.socket.send(JSON.stringify(msg));
  }

  sendData(data): void {
    /**
     * Emits any Binary object sent to the service from the client. Mainly used for debugging.
     * @event RecognizeStream#send-data
     * @param {Object} msg
     */
    this.emit('send-data', data);
    return this.socket.send(data);
  }

  /**
   * Flow control - don't ask for more data until we've finished what we have
   *
   * Notes:
   *
   * This limits upload speed to 100 * options.highWaterMark / second.
   *
   * The default highWaterMark is 16kB, so the default max upload speed is ~1.6MB/s.
   *
   * Microphone input provides audio at a (downsampled) rate of:
   *   16000 samples/s * 16-bits * 1 channel = 32kB/s
   * (note the bits to Bytes conversion there)
   *
   * @private
   * @param {Function} next
   */
  afterSend(next): void {
    if (
      this.socket.bufferedAmount <= (this._writableState.highWaterMark || 0)
    ) {
      process.nextTick(next);
    } else {
      setTimeout(this.afterSend.bind(this, next), 10);
    }
  }

  /**
   * Prevents any more audio from being sent over the WebSocket and gracefully closes the connection.
   * Additional data may still be emitted up until the `end` event is triggered.
   */
  stop(): void {
    /**
     * Event emitted when the stop method is called. Mainly for synchronising with file reading and playback.
     * @event RecognizeStream#stop
     */
    this.emit('stop');
    this.finish();
  }

  _read(): void /* size*/ {
    // there's no easy way to control reads from the underlying library
    // so, the best we can do here is a no-op
  }


  _write(chunk, encoding, callback): void {
    this.setAuthorizationHeaderToken(err => {
      if (err) {
        this.emit('error', err);
        this.push(null);
        return;
      }
      const self = this;
      if (self.finished) {
        // can't send any more data after the stop message (although this shouldn't happen normally...)
        return;
      }

      if (!this.initialized) {
        if (!this.options['content-type'] && !this.options.content_type) {
          const ct = RecognizeStream.getContentType(chunk);
          if (ct) {
            this.options['content-type'] = ct;
          } else {
            const error = new Error(
              'Unable to determine content-type from file header, please specify manually.'
            );
            error.name = RecognizeStream.ERROR_UNRECOGNIZED_FORMAT;
            this.emit('error', error);
            this.push(null);
            return;
          }
        }
        this.initialize();

        this.once('open', () => {
          self.sendData(chunk);
          self.afterSend(callback);
        });
      } else {
        self.sendData(chunk);
        this.afterSend(callback);
      }
    })
  }


  finish(): void {
    // this is called both when the source stream finishes, and when .stop() is fired, but we only want to send the stop message once.
    if (this.finished) {
      return;
    }
    this.finished = true;
    const self = this;
    const closingMessage = { action: 'stop' };
    if (self.socket && self.socket.readyState === self.socket.OPEN) {
      self.sendJSON(closingMessage);
    } else {
      this.once('open', () => {
        self.sendJSON(closingMessage);
      });
    }
  }

  /**
   * Returns a Promise that resolves with Watson Transaction ID from the X-Transaction-ID header
   *
   * Works in Node.js but not in browsers (the W3C WebSocket API does not expose headers)
   *
   * @return Promise<String>
   */
  getTransactionId(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (
        this.socket &&
        this.socket._client &&
        this.socket._client.response &&
        this.socket._client.response.headers
      ) {
        resolve(
          this.socket._client.response.headers['x-global-transaction-id']
        );
      } else {
        this.on('open', () =>
          resolve(
            this.socket._client.response.headers['x-global-transaction-id']
          )
        );
        this.on('error', reject);
      }
    });
  }

  /**
   * This function retrieves an IAM access token and stores it in the
   * request header before calling the callback function, which will
   * execute the next iteration of `_write()`
   *
   *
   * @private
   * @param {Function} callback
   */
  setAuthorizationHeaderToken(callback) {
    if (this.options.token_manager) {
      this.options.token_manager.getToken((err, token) => {
        if (err) {
          callback(err);
        }
        const authHeader = { authorization: 'Bearer ' + token };
        this.options.headers = extend(this.options.headers, authHeader);
        callback(null);
      });
    } else {
      callback(null);
    }
  }
}

export = RecognizeStream;
