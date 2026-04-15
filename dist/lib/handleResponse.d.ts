/**
 * Error types for handleResponse
 */
declare class JsonParseError extends Error {
  responseStatusCode: number
  responseCause?: unknown
  constructor(message: string, cause?: unknown)
}
declare class HttpStatusError extends Error {
  responseStatusCode: number
  responseUrl?: string
  responseBody?: string
  constructor(message: string, statusCode: number, url?: string, body?: string)
}
declare class SizeLimitError extends Error {
  responseStatusCode: number
  responseUrl?: string
  constructor(message: string, url?: string)
}
declare class NetworkError extends Error {
  responseStatusCode: number
  responseCause?: unknown
  constructor(message: string, cause?: unknown)
}
type ResponseError = JsonParseError | HttpStatusError | SizeLimitError | NetworkError
declare const isResponseError: (error: unknown) => error is ResponseError
export { JsonParseError, HttpStatusError, SizeLimitError, NetworkError, isResponseError }
/**
 * Handles an HTTP response, collecting data and resolving or rejecting a promise.
 * Automatically parses JSON responses based on content-type header.
 * Accepts any 2xx status code as successful.
 */
export declare const handleResponse: (
  res: {
    statusCode?: number
    headers: Record<string, string | string[] | undefined>
    setEncoding?: (enc: BufferEncoding) => void
    on: (event: string, cb: (chunk?: string | Buffer) => void) => void
    destroy?: () => void
  },
  resolve: (value: unknown) => void,
  reject: (reason?: unknown) => void,
  url?: string,
  maxSize?: number,
) => void
