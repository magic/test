import is from '@magic/types'

/**
 * Error types for handleResponse
 */
class JsonParseError extends Error {
  responseStatusCode = 0
  responseCause?: unknown
  constructor(message: string, cause?: unknown) {
    super(message)
    this.responseCause = cause
  }
}

class HttpStatusError extends Error {
  responseStatusCode: number
  responseUrl?: string
  responseBody?: string
  constructor(message: string, statusCode: number, url?: string, body?: string) {
    super(message)
    this.responseStatusCode = statusCode
    this.responseUrl = url
    this.responseBody = body
  }
}

class SizeLimitError extends Error {
  responseStatusCode = 413
  responseUrl?: string
  constructor(message: string, url?: string) {
    super(message)
    this.responseUrl = url
  }
}

class NetworkError extends Error {
  responseStatusCode = 0
  responseCause?: unknown
  constructor(message: string, cause?: unknown) {
    super(message)
    this.responseCause = cause
  }
}

type ResponseError = JsonParseError | HttpStatusError | SizeLimitError | NetworkError

const isResponseError = (error: unknown): error is ResponseError => {
  return (
    error instanceof JsonParseError ||
    error instanceof HttpStatusError ||
    error instanceof SizeLimitError ||
    error instanceof NetworkError
  )
}

export { JsonParseError, HttpStatusError, SizeLimitError, NetworkError, isResponseError }

/**
 * Handles an HTTP response, collecting data and resolving or rejecting a promise.
 * Automatically parses JSON responses based on content-type header.
 * Accepts any 2xx status code as successful.
 */
export const handleResponse = (
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
): void => {
  const { statusCode } = res
  const contentType = is.string(res.headers['content-type'])
    ? res.headers['content-type']
    : undefined

  let err

  if (!statusCode || statusCode < 200 || statusCode >= 300) {
    err = `Request failed: ${statusCode ?? 'unknown'}`
    if (url) {
      err += `\nURL: ${url}`
    }
  }

  if (err) {
    const chunks: string[] = []
    res.setEncoding?.('utf8')
    res.on?.('data', chunk => {
      if (chunk) chunks.push(String(chunk))
    })
    res.on?.('end', () => {
      let errorMessage = err
      let body: string | undefined
      if (chunks.length > 0) {
        body = chunks.join('')
        const truncated = body.substring(0, 200)
        const sanitized = truncated.replace(/(password|token|secret|key)=[^&]+/gi, '$1=***')
        errorMessage += `\nResponse body: ${sanitized}`
      }
      const error = new HttpStatusError(errorMessage, statusCode ?? 0, url, body)
      reject(error)
    })
    return
  }

  const chunks: string[] = []
  let responseSize = 0
  res.setEncoding?.('utf8')
  res.on?.('data', chunk => {
    if (!chunk) return
    const chunkStr = String(chunk)
    if (maxSize && responseSize + chunkStr.length > maxSize) {
      res.destroy?.()
      const error = new SizeLimitError(
        `Response size exceeds limit of ${maxSize} bytes${url ? ': ' + url : ''}`,
        url,
      )
      reject(error)
      return
    }
    responseSize += chunkStr.length
    chunks.push(chunkStr)
  })
  res.on?.('end', () => {
    const rawData = chunks.join('')
    if (contentType === 'application/json') {
      try {
        const data = JSON.parse(rawData)
        resolve(data)
        return
      } catch (e: unknown) {
        const error = new JsonParseError('Failed to parse JSON response', e)
        reject(error)
        return
      }
    }

    resolve(rawData)
  })
}
