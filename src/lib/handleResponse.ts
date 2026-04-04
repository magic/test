/**
 * HttpError with optional statusCode
 */
interface HttpError extends Error {
  statusCode?: number
}

/**
 * Handles an HTTP response, collecting data and resolving or rejecting a promise.
 * Automatically parses JSON responses based on content-type header.
 * Accepts any 2xx status code as successful.
 */
export const handleResponse = (
  res: import('http').IncomingMessage,
  resolve: (value: unknown) => void,
  reject: (reason?: unknown) => void,
  url?: string,
  maxSize?: number,
): void => {
  const { statusCode } = res
  const contentType = res.headers['content-type']

  let err

  if (!statusCode || statusCode < 200 || statusCode >= 300) {
    err = `Request failed: ${statusCode ?? 'unknown'}`
    if (url) {
      err += `\nURL: ${url}`
    }
  }

  if (err) {
    const chunks: string[] = []
    res.setEncoding('utf8')
    res.on('data', (chunk: string) => chunks.push(chunk))
    res.on('end', () => {
      let errorMessage = err
      if (chunks.length > 0) {
        const body = chunks.join('')
        const truncated = body.substring(0, 200)
        const sanitized = truncated.replace(/(password|token|secret|key)=[^&]+/gi, '$1=***')
        errorMessage += `\nResponse body: ${sanitized}`
      }
      const error = new Error(errorMessage) as HttpError
      error.statusCode = statusCode
      reject(error)
    })
    return
  }

  const chunks: string[] = []
  let responseSize = 0
  res.setEncoding('utf8')
  res.on('data', (chunk: string) => {
    if (maxSize && responseSize + chunk.length > maxSize) {
      res.destroy()
      const error = new Error(
        `Response size exceeds limit of ${maxSize} bytes${url ? ': ' + url : ''}`,
      ) as HttpError
      error.statusCode = 413
      reject(error)
      return
    }
    responseSize += chunk.length
    chunks.push(chunk)
  })
  res.on('end', () => {
    const rawData = chunks.join('')
    if (contentType === 'application/json') {
      try {
        const data = JSON.parse(rawData)
        resolve(data)
        return
      } catch (e: unknown) {
        reject(e)
        return
      }
    }

    resolve(rawData)
  })
}
