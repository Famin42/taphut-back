import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * An HTTP Request interface that's compatible with Lambda events
 */
export interface IHttpRequest {
  path: string;
  httpMethod: string;
  queryStringParameters?: { [key: string]: string };
  pathParameters?: { [key: string]: string };
  body?: string;
}

interface IHeaderDict {
  [key: string]: string;
}

/**
 * An HTTP Response interface that's compatible with Lambda callbacks
 */
export interface IHttpResponse {
  statusCode: number;
  headers?: IHeaderDict;
  body?: unknown;
}

/**
 * get an error {@IHttpResponse} with specified error code and an error message
 * @param {number} code
 * @param {string} message
 * @returns {IHttpResponse}
 */
export function httpError(code: number, message: string, headers?: IHeaderDict): IHttpResponse {
  return {
    statusCode: code,
    body: { error: message },
    headers,
  };
}

/**
 * get success {@IHttpResponse} with given payload
 * @param {object} payload
 * @returns {IHttpResponse}
 */
export function httpSuccess(payload?: unknown, headers?: IHeaderDict): IHttpResponse {
  return {
    statusCode: 200,
    body: payload,
    headers,
  };
}

/**
 * get redirect {@IHttpResponse} with given location
 * @param {string} Location URL to redirect to
 * @returns {IHttpResponse}
 */
export function httpRedirect(Location: string): IHttpResponse {
  return {
    statusCode: 302,
    headers: {
      Location,
    },
  };
}

/**
 * convert IHttpResponse to lambda compatible response
 * @param {IHttpResponse} res
 * @returns {object}
 */
export function toLambdaHttpResponse(res: IHttpResponse): APIGatewayProxyResult {
  const body: string = JSON.stringify(res.body);
  return {
    ...res,
    body,
  };
}
