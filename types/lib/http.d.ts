export function get(url: string, options?: HttpOptions): Promise<ResponseData>
export function post(url: string, body?: RequestBody, options?: HttpOptions): Promise<ResponseData>
/**
 * HTTP utility object with get and post methods.
 * @type {{ get: (url: string, options?: HttpOptions) => Promise<ResponseData>, post: (url: string, body?: RequestBody, options?: HttpOptions) => Promise<ResponseData> }}
 */
export const http: {
  get: (url: string, options?: HttpOptions) => Promise<ResponseData>
  post: (url: string, body?: RequestBody, options?: HttpOptions) => Promise<ResponseData>
}
/**
 * An object representing JSON request body data.
 */
export type BodyObject = Record<string, unknown>
/**
 * Either a string or an object to be JSON-stringified.
 */
export type RequestBody = string | BodyObject
/**
 * The parsed response data (could be JSON or string).
 */
export type ResponseData = unknown
export type HttpOptions = {
  /**
   * - Request timeout in milliseconds
   */
  timeout?: number | undefined
  /**
   * - Whether to reject self-signed certs (default: true)
   */
  rejectUnauthorized?: boolean | undefined
  /**
   * - Maximum response size in bytes
   */
  maxSize?: number | undefined
  /**
   * - Extended options for http/https
   */
  requestOptions?: (nodeHttp.RequestOptions & nodeHttps.RequestOptions) | undefined
}
import nodeHttp from 'node:http'
import nodeHttps from 'node:https'
//# sourceMappingURL=http.d.ts.map
