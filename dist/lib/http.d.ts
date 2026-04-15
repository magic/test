import nodeHttp from 'node:http'
import nodeHttps from 'node:https'
type BodyObject = Record<string, unknown>
type RequestBody = string | BodyObject
interface HttpOptions {
  timeout?: number
  rejectUnauthorized?: boolean
  maxSize?: number
  requestOptions?: nodeHttp.RequestOptions & nodeHttps.RequestOptions
}
/**
 * Perform an HTTP GET request.
 * Automatically handles both HTTP and HTTPS protocols based on URL.
 *
 *
 * const data = await get('https://api.example.com/data')
 * console.log(data) // Parsed JSON or raw string
 *
 * const data = await get('https://self-signed.badssl.com', { rejectUnauthorized: false })
 */
export declare const get: (url: string, options?: HttpOptions) => Promise<unknown>
/**
 * Perform an HTTP POST request with optional JSON body.
 * Automatically handles both HTTP and HTTPS protocols based on URL.
 * Sets appropriate Content-Type and Content-Length headers for JSON.
 *
 *
 * const result = await post('https://api.example.com/users', { name: 'John' })
 *
 * const result = await post('http://localhost:3000/data', 'raw string')
 *
 * const result = await post('https://self-signed.badssl.com', { data: 'test' }, { rejectUnauthorized: false })
 */
export declare const post: (
  url: string,
  body?: RequestBody,
  options?: HttpOptions,
) => Promise<unknown>
/**
 * HTTP utility object with get and post methods.
 */
export declare const http: {
  get: (url: string, options?: HttpOptions) => Promise<unknown>
  post: (url: string, body?: RequestBody, options?: HttpOptions) => Promise<unknown>
}
export {}
