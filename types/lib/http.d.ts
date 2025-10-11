export function get(url: string): Promise<ResponseData>
export function post(url: string, body?: RequestBody): Promise<ResponseData>
/**
 * HTTP utility object with get and post methods.
 * @type {{ get: (url: string) => Promise<ResponseData>, post: (url: string, body?: RequestBody) => Promise<ResponseData> }}
 */
export const http: {
  get: (url: string) => Promise<ResponseData>
  post: (url: string, body?: RequestBody) => Promise<ResponseData>
}
/**
 * An object representing JSON request body data.
 */
export type BodyObject = Record<string, any>
/**
 * Either a string or an object to be JSON-stringified.
 */
export type RequestBody = string | BodyObject
/**
 * The parsed response data (could be JSON or string).
 */
export type ResponseData = unknown
//# sourceMappingURL=http.d.ts.map
