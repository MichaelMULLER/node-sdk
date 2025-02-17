/**
 * (C) Copyright IBM Corp. 2017, 2019.
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
 * limitations under the License.
 */

import * as extend from 'extend';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { BaseService, getMissingParams } from 'ibm-cloud-sdk-core';
import { getSdkHeaders } from '../lib/common';

/**
 * The IBM Watson&trade; Tone Analyzer service uses linguistic analysis to detect emotional and language tones in written text. The service can analyze tone at both the document and sentence levels. You can use the service to understand how your written communications are perceived and then to improve the tone of your communications. Businesses can use the service to learn the tone of their customers' communications and to respond to each customer appropriately, or to understand and improve their customer conversations.  **Note:** Request logging is disabled for the Tone Analyzer service. Regardless of whether you set the `X-Watson-Learning-Opt-Out` request header, the service does not log or retain data from requests and responses.
 */

class ToneAnalyzerV3 extends BaseService {

  static URL: string = 'https://gateway.watsonplatform.net/tone-analyzer/api';
  name: string; // set by prototype to 'tone_analyzer'
  serviceVersion: string; // set by prototype to 'v3'

  /**
   * Construct a ToneAnalyzerV3 object.
   *
   * @param {Object} options - Options for the service.
   * @param {string} options.version - The API version date to use with the service, in "YYYY-MM-DD" format. Whenever the API is changed in a backwards incompatible way, a new minor version of the API is released. The service uses the API version for the date you specify, or the most recent version before that date. Note that you should not programmatically specify the current date at runtime, in case the API has been updated since your application's release. Instead, specify a version date that is compatible with your application, and don't change it until your application is ready for a later version.
   * @param {string} [options.url] - The base url to use when contacting the service (e.g. 'https://gateway.watsonplatform.net/tone-analyzer/api'). The base url may differ between IBM Cloud regions.
   * @param {string} [options.username] - The username used to authenticate with the service. Username and password credentials are only required to run your application locally or outside of IBM Cloud. When running on IBM Cloud, the credentials will be automatically loaded from the `VCAP_SERVICES` environment variable.
   * @param {string} [options.password] - The password used to authenticate with the service. Username and password credentials are only required to run your application locally or outside of IBM Cloud. When running on IBM Cloud, the credentials will be automatically loaded from the `VCAP_SERVICES` environment variable.
   * @param {string} [options.iam_access_token] - An IAM access token fully managed by the application. Responsibility falls on the application to refresh the token, either before it expires or reactively upon receiving a 401 from the service, as any requests made with an expired token will fail.
   * @param {string} [options.iam_apikey] - An API key that can be used to request IAM tokens. If this API key is provided, the SDK will manage the token and handle the refreshing.
   * @param {string} [options.iam_url] - An optional URL for the IAM service API. Defaults to 'https://iam.cloud.ibm.com/identity/token'.
   * @param {string} [options.iam_client_id] - client id (username) for request to iam service
   * @param {string} [options.iam_client_secret] - client secret (password) for request to iam service
   * @param {string} [options.icp4d_access_token] - icp for data access token provided and managed by user
   * @param {string} [options.icp4d_url] - icp for data base url - used for authentication
   * @param {string} [options.authentication_type] - authentication pattern to be used. can be iam, basic, or icp4d
   * @param {boolean} [options.use_unauthenticated] - Set to `true` to avoid including an authorization header. This
   * option may be useful for requests that are proxied.
   * @param {OutgoingHttpHeaders} [options.headers] - Default headers that shall be included with every request to the service.
   * @param {boolean} [options.headers.X-Watson-Learning-Opt-Out] - Set to `true` to opt-out of data collection. By
   * default, all IBM Watson services log requests and their results. Logging is done only to improve the services for
   * future users. The logged data is not shared or made public. If you are concerned with protecting the privacy of
   * users' personal information or otherwise do not want your requests to be logged, you can opt out of logging.
   * @constructor
   * @returns {ToneAnalyzerV3}
   * @throws {Error}
   */
  constructor(options: ToneAnalyzerV3.Options) {
    super(options);
    // check if 'version' was provided
    if (typeof this._options.version === 'undefined') {
      throw new Error('Argument error: version was not specified');
    }
    this._options.qs.version = options.version;
  }

  /*************************
   * methods
   ************************/

  /**
   * Analyze general tone.
   *
   * Use the general-purpose endpoint to analyze the tone of your input content. The service analyzes the content for
   * emotional and language tones. The method always analyzes the tone of the full document; by default, it also
   * analyzes the tone of each individual sentence of the content.
   *
   * You can submit no more than 128 KB of total input content and no more than 1000 individual sentences in JSON, plain
   * text, or HTML format. The service analyzes the first 1000 sentences for document-level analysis and only the first
   * 100 sentences for sentence-level analysis.
   *
   * Per the JSON specification, the default character encoding for JSON content is effectively always UTF-8; per the
   * HTTP specification, the default encoding for plain text and HTML is ISO-8859-1 (effectively, the ASCII character
   * set). When specifying a content type of plain text or HTML, include the `charset` parameter to indicate the
   * character encoding of the input text; for example: `Content-Type: text/plain;charset=utf-8`. For `text/html`, the
   * service removes HTML tags and analyzes only the textual content.
   *
   * **See also:** [Using the general-purpose
   * endpoint](https://cloud.ibm.com/docs/services/tone-analyzer?topic=tone-analyzer-utgpe#utgpe).
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {ToneInput|string} params.tone_input - JSON, plain text, or HTML input that contains the content to be
   * analyzed. For JSON input, provide an object of type `ToneInput`.
   * @param {boolean} [params.sentences] - Indicates whether the service is to return an analysis of each individual
   * sentence in addition to its analysis of the full document. If `true` (the default), the service returns results for
   * each sentence.
   * @param {string[]} [params.tones] - **`2017-09-21`:** Deprecated. The service continues to accept the parameter for
   * backward-compatibility, but the parameter no longer affects the response.
   *
   * **`2016-05-19`:** A comma-separated list of tones for which the service is to return its analysis of the input; the
   * indicated tones apply both to the full document and to individual sentences of the document. You can specify one or
   * more of the valid values. Omit the parameter to request results for all three tones.
   * @param {string} [params.content_language] - The language of the input text for the request: English or French.
   * Regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. The input
   * content must match the specified language. Do not submit content that contains both languages. You can use
   * different languages for **Content-Language** and **Accept-Language**.
   * * **`2017-09-21`:** Accepts `en` or `fr`.
   * * **`2016-05-19`:** Accepts only `en`.
   * @param {string} [params.accept_language] - The desired language of the response. For two-character arguments,
   * regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. You can use
   * different languages for **Content-Language** and **Accept-Language**.
   * @param {string} [params.content_type] - The type of the input. A character encoding can be specified by including a
   * `charset` parameter. For example, 'text/plain;charset=utf-8'.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public tone(params: ToneAnalyzerV3.ToneParams, callback?: ToneAnalyzerV3.Callback<ToneAnalyzerV3.ToneAnalysis>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['tone_input'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.tone(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }
    const body = _params.tone_input;

    const query = {
      'sentences': _params.sentences,
      'tones': _params.tones
    };

    const sdkHeaders = getSdkHeaders('tone_analyzer', 'v3', 'tone');

    const parameters = {
      options: {
        url: '/v3/tone',
        method: 'POST',
        body,
        qs: query,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
          'Content-Language': _params.content_language,
          'Accept-Language': _params.accept_language,
          'Content-Type': _params.content_type
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

  /**
   * Analyze customer-engagement tone.
   *
   * Use the customer-engagement endpoint to analyze the tone of customer service and customer support conversations.
   * For each utterance of a conversation, the method reports the most prevalent subset of the following seven tones:
   * sad, frustrated, satisfied, excited, polite, impolite, and sympathetic.
   *
   * If you submit more than 50 utterances, the service returns a warning for the overall content and analyzes only the
   * first 50 utterances. If you submit a single utterance that contains more than 500 characters, the service returns
   * an error for that utterance and does not analyze the utterance. The request fails if all utterances have more than
   * 500 characters. Per the JSON specification, the default character encoding for JSON content is effectively always
   * UTF-8.
   *
   * **See also:** [Using the customer-engagement
   * endpoint](https://cloud.ibm.com/docs/services/tone-analyzer?topic=tone-analyzer-utco#utco).
   *
   * @param {Object} params - The parameters to send to the service.
   * @param {Utterance[]} params.utterances - An array of `Utterance` objects that provides the input content that the
   * service is to analyze.
   * @param {string} [params.content_language] - The language of the input text for the request: English or French.
   * Regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. The input
   * content must match the specified language. Do not submit content that contains both languages. You can use
   * different languages for **Content-Language** and **Accept-Language**.
   * * **`2017-09-21`:** Accepts `en` or `fr`.
   * * **`2016-05-19`:** Accepts only `en`.
   * @param {string} [params.accept_language] - The desired language of the response. For two-character arguments,
   * regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. You can use
   * different languages for **Content-Language** and **Accept-Language**.
   * @param {OutgoingHttpHeaders} [params.headers] - Custom request headers
   * @param {Function} [callback] - The callback that handles the response.
   * @returns {Promise<any>|void}
   */
  public toneChat(params: ToneAnalyzerV3.ToneChatParams, callback?: ToneAnalyzerV3.Callback<ToneAnalyzerV3.UtteranceAnalyses>): Promise<any> | void {
    const _params = extend({}, params);
    const _callback = callback;
    const requiredParams = ['utterances'];

    if (!_callback) {
      return new Promise((resolve, reject) => {
        this.toneChat(params, (err, bod, res) => {
          err ? reject(err) : _params.return_response ? resolve(res) : resolve(bod);
        });
      });
    }

    const missingParams = getMissingParams(_params, requiredParams);
    if (missingParams) {
      return _callback(missingParams);
    }

    const body = {
      'utterances': _params.utterances
    };

    const sdkHeaders = getSdkHeaders('tone_analyzer', 'v3', 'toneChat');

    const parameters = {
      options: {
        url: '/v3/tone_chat',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this._options, {
        headers: extend(true, sdkHeaders, {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Content-Language': _params.content_language,
          'Accept-Language': _params.accept_language
        }, _params.headers),
      }),
    };

    return this.createRequest(parameters, _callback);
  };

}

ToneAnalyzerV3.prototype.name = 'tone_analyzer';
ToneAnalyzerV3.prototype.serviceVersion = 'v3';

/*************************
 * interfaces
 ************************/

namespace ToneAnalyzerV3 {

  /** Options for the `ToneAnalyzerV3` constructor. */
  export type Options = {
    version: string;
    url?: string;
    iam_access_token?: string;
    iam_apikey?: string;
    iam_url?: string;
    iam_client_id?: string;
    iam_client_secret?: string;
    icp4d_access_token?: string;
    icp4d_url?: string;
    username?: string;
    password?: string;
    token?: string;
    authentication_type?: string;
    disable_ssl_verification?: boolean;
    use_unauthenticated?: boolean;
    headers?: OutgoingHttpHeaders;
    /** Allow additional request config parameters */
    [propName: string]: any;
  }

  export interface Response<T = any>  {
    result: T;
    data: T; // for compatibility
    status: number;
    statusText: string;
    headers: IncomingHttpHeaders;
  }

  /** The callback for a service request. */
  export type Callback<T> = (error: any, body?: T, response?: Response<T>) => void;

  /** The body of a service request that returns no response data. */
  export interface Empty { }

  /** A standard JS object, defined to avoid the limitations of `Object` and `object` */
  export interface JsonObject {
    [key: string]: any;
  }

  /*************************
   * request interfaces
   ************************/

  /** Parameters for the `tone` operation. */
  export interface ToneParams {
    /** JSON, plain text, or HTML input that contains the content to be analyzed. For JSON input, provide an object of type `ToneInput`. */
    tone_input: ToneInput|string;
    /** Indicates whether the service is to return an analysis of each individual sentence in addition to its analysis of the full document. If `true` (the default), the service returns results for each sentence. */
    sentences?: boolean;
    /** **`2017-09-21`:** Deprecated. The service continues to accept the parameter for backward-compatibility, but the parameter no longer affects the response. **`2016-05-19`:** A comma-separated list of tones for which the service is to return its analysis of the input; the indicated tones apply both to the full document and to individual sentences of the document. You can specify one or more of the valid values. Omit the parameter to request results for all three tones. */
    tones?: ToneConstants.Tones[] | string[];
    /** The language of the input text for the request: English or French. Regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. The input content must match the specified language. Do not submit content that contains both languages. You can use different languages for **Content-Language** and **Accept-Language**. * **`2017-09-21`:** Accepts `en` or `fr`. * **`2016-05-19`:** Accepts only `en`. */
    content_language?: ToneConstants.ContentLanguage | string;
    /** The desired language of the response. For two-character arguments, regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. You can use different languages for **Content-Language** and **Accept-Language**. */
    accept_language?: ToneConstants.AcceptLanguage | string;
    /** The type of the input. A character encoding can be specified by including a `charset` parameter. For example, 'text/plain;charset=utf-8'. */
    content_type?: ToneConstants.ContentType | string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Constants for the `tone` operation. */
  export namespace ToneConstants {
    /** **`2017-09-21`:** Deprecated. The service continues to accept the parameter for backward-compatibility, but the parameter no longer affects the response. **`2016-05-19`:** A comma-separated list of tones for which the service is to return its analysis of the input; the indicated tones apply both to the full document and to individual sentences of the document. You can specify one or more of the valid values. Omit the parameter to request results for all three tones. */
    export enum Tones {
      EMOTION = 'emotion',
      LANGUAGE = 'language',
      SOCIAL = 'social',
    }
    /** The language of the input text for the request: English or French. Regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. The input content must match the specified language. Do not submit content that contains both languages. You can use different languages for **Content-Language** and **Accept-Language**. * **`2017-09-21`:** Accepts `en` or `fr`. * **`2016-05-19`:** Accepts only `en`. */
    export enum ContentLanguage {
      EN = 'en',
      FR = 'fr',
    }
    /** The desired language of the response. For two-character arguments, regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. You can use different languages for **Content-Language** and **Accept-Language**. */
    export enum AcceptLanguage {
      AR = 'ar',
      DE = 'de',
      EN = 'en',
      ES = 'es',
      FR = 'fr',
      IT = 'it',
      JA = 'ja',
      KO = 'ko',
      PT_BR = 'pt-br',
      ZH_CN = 'zh-cn',
      ZH_TW = 'zh-tw',
    }
    /** The type of the input. A character encoding can be specified by including a `charset` parameter. For example, 'text/plain;charset=utf-8'. */
    export enum ContentType {
      APPLICATION_JSON = 'application/json',
      TEXT_PLAIN = 'text/plain',
      TEXT_HTML = 'text/html',
    }
  }

  /** Parameters for the `toneChat` operation. */
  export interface ToneChatParams {
    /** An array of `Utterance` objects that provides the input content that the service is to analyze. */
    utterances: Utterance[];
    /** The language of the input text for the request: English or French. Regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. The input content must match the specified language. Do not submit content that contains both languages. You can use different languages for **Content-Language** and **Accept-Language**. * **`2017-09-21`:** Accepts `en` or `fr`. * **`2016-05-19`:** Accepts only `en`. */
    content_language?: ToneChatConstants.ContentLanguage | string;
    /** The desired language of the response. For two-character arguments, regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. You can use different languages for **Content-Language** and **Accept-Language**. */
    accept_language?: ToneChatConstants.AcceptLanguage | string;
    headers?: OutgoingHttpHeaders;
    return_response?: boolean;
  }

  /** Constants for the `toneChat` operation. */
  export namespace ToneChatConstants {
    /** The language of the input text for the request: English or French. Regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. The input content must match the specified language. Do not submit content that contains both languages. You can use different languages for **Content-Language** and **Accept-Language**. * **`2017-09-21`:** Accepts `en` or `fr`. * **`2016-05-19`:** Accepts only `en`. */
    export enum ContentLanguage {
      EN = 'en',
      FR = 'fr',
    }
    /** The desired language of the response. For two-character arguments, regional variants are treated as their parent language; for example, `en-US` is interpreted as `en`. You can use different languages for **Content-Language** and **Accept-Language**. */
    export enum AcceptLanguage {
      AR = 'ar',
      DE = 'de',
      EN = 'en',
      ES = 'es',
      FR = 'fr',
      IT = 'it',
      JA = 'ja',
      KO = 'ko',
      PT_BR = 'pt-br',
      ZH_CN = 'zh-cn',
      ZH_TW = 'zh-tw',
    }
  }

  /*************************
   * model interfaces
   ************************/

  /** The results of the analysis for the full input content. */
  export interface DocumentAnalysis {
    /** **`2017-09-21`:** An array of `ToneScore` objects that provides the results of the analysis for each qualifying tone of the document. The array includes results for any tone whose score is at least 0.5. The array is empty if no tone has a score that meets this threshold. **`2016-05-19`:** Not returned. */
    tones?: ToneScore[];
    /** **`2017-09-21`:** Not returned. **`2016-05-19`:** An array of `ToneCategory` objects that provides the results of the tone analysis for the full document of the input content. The service returns results only for the tones specified with the `tones` parameter of the request. */
    tone_categories?: ToneCategory[];
    /** **`2017-09-21`:** A warning message if the overall content exceeds 128 KB or contains more than 1000 sentences. The service analyzes only the first 1000 sentences for document-level analysis and the first 100 sentences for sentence-level analysis. **`2016-05-19`:** Not returned. */
    warning?: string;
  }

  /** The results of the analysis for the individual sentences of the input content. */
  export interface SentenceAnalysis {
    /** The unique identifier of a sentence of the input content. The first sentence has ID 0, and the ID of each subsequent sentence is incremented by one. */
    sentence_id: number;
    /** The text of the input sentence. */
    text: string;
    /** **`2017-09-21`:** An array of `ToneScore` objects that provides the results of the analysis for each qualifying tone of the sentence. The array includes results for any tone whose score is at least 0.5. The array is empty if no tone has a score that meets this threshold. **`2016-05-19`:** Not returned. */
    tones?: ToneScore[];
    /** **`2017-09-21`:** Not returned. **`2016-05-19`:** An array of `ToneCategory` objects that provides the results of the tone analysis for the sentence. The service returns results only for the tones specified with the `tones` parameter of the request. */
    tone_categories?: ToneCategory[];
    /** **`2017-09-21`:** Not returned. **`2016-05-19`:** The offset of the first character of the sentence in the overall input content. */
    input_from?: number;
    /** **`2017-09-21`:** Not returned. **`2016-05-19`:** The offset of the last character of the sentence in the overall input content. */
    input_to?: number;
  }

  /** The tone analysis results for the input from the general-purpose endpoint. */
  export interface ToneAnalysis {
    /** The results of the analysis for the full input content. */
    document_tone: DocumentAnalysis;
    /** An array of `SentenceAnalysis` objects that provides the results of the analysis for the individual sentences of the input content. The service returns results only for the first 100 sentences of the input. The field is omitted if the `sentences` parameter of the request is set to `false`. */
    sentences_tone?: SentenceAnalysis[];
  }

  /** The category for a tone from the input content. */
  export interface ToneCategory {
    /** An array of `ToneScore` objects that provides the results for the tones of the category. */
    tones: ToneScore[];
    /** The unique, non-localized identifier of the category for the results. The service can return results for the following category IDs: `emotion_tone`, `language_tone`, and `social_tone`. */
    category_id: string;
    /** The user-visible, localized name of the category. */
    category_name: string;
  }

  /** The score for an utterance from the input content. */
  export interface ToneChatScore {
    /** The score for the tone in the range of 0.5 to 1. A score greater than 0.75 indicates a high likelihood that the tone is perceived in the utterance. */
    score: number;
    /** The unique, non-localized identifier of the tone for the results. The service returns results only for tones whose scores meet a minimum threshold of 0.5. */
    tone_id: string;
    /** The user-visible, localized name of the tone. */
    tone_name: string;
  }

  /** Input for the general-purpose endpoint. */
  export interface ToneInput {
    /** The input content that the service is to analyze. */
    text: string;
  }

  /** The score for a tone from the input content. */
  export interface ToneScore {
    /** The score for the tone. * **`2017-09-21`:** The score that is returned lies in the range of 0.5 to 1. A score greater than 0.75 indicates a high likelihood that the tone is perceived in the content. * **`2016-05-19`:** The score that is returned lies in the range of 0 to 1. A score less than 0.5 indicates that the tone is unlikely to be perceived in the content; a score greater than 0.75 indicates a high likelihood that the tone is perceived. */
    score: number;
    /** The unique, non-localized identifier of the tone. * **`2017-09-21`:** The service can return results for the following tone IDs: `anger`, `fear`, `joy`, and `sadness` (emotional tones); `analytical`, `confident`, and `tentative` (language tones). The service returns results only for tones whose scores meet a minimum threshold of 0.5. * **`2016-05-19`:** The service can return results for the following tone IDs of the different categories: for the `emotion` category: `anger`, `disgust`, `fear`, `joy`, and `sadness`; for the `language` category: `analytical`, `confident`, and `tentative`; for the `social` category: `openness_big5`, `conscientiousness_big5`, `extraversion_big5`, `agreeableness_big5`, and `emotional_range_big5`. The service returns scores for all tones of a category, regardless of their values. */
    tone_id: string;
    /** The user-visible, localized name of the tone. */
    tone_name: string;
  }

  /** An utterance for the input of the general-purpose endpoint. */
  export interface Utterance {
    /** An utterance contributed by a user in the conversation that is to be analyzed. The utterance can contain multiple sentences. */
    text: string;
    /** A string that identifies the user who contributed the utterance specified by the `text` parameter. */
    user?: string;
  }

  /** The results of the analysis for the utterances of the input content. */
  export interface UtteranceAnalyses {
    /** An array of `UtteranceAnalysis` objects that provides the results for each utterance of the input. */
    utterances_tone: UtteranceAnalysis[];
    /** **`2017-09-21`:** A warning message if the content contains more than 50 utterances. The service analyzes only the first 50 utterances. **`2016-05-19`:** Not returned. */
    warning?: string;
  }

  /** The results of the analysis for an utterance of the input content. */
  export interface UtteranceAnalysis {
    /** The unique identifier of the utterance. The first utterance has ID 0, and the ID of each subsequent utterance is incremented by one. */
    utterance_id: number;
    /** The text of the utterance. */
    utterance_text: string;
    /** An array of `ToneChatScore` objects that provides results for the most prevalent tones of the utterance. The array includes results for any tone whose score is at least 0.5. The array is empty if no tone has a score that meets this threshold. */
    tones: ToneChatScore[];
    /** **`2017-09-21`:** An error message if the utterance contains more than 500 characters. The service does not analyze the utterance. **`2016-05-19`:** Not returned. */
    error?: string;
  }

}

export = ToneAnalyzerV3;
