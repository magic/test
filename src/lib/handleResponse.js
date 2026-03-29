/**
 * @typedef {Error & { statusCode?: number }} HttpError
 */

/**
 * Handles an HTTP response, collecting data and resolving or rejecting a promise.
 * Automatically parses JSON responses based on content-type header.
 * Accepts any 2xx status code as successful.
 *
 * @param {import('http').IncomingMessage} res - The HTTP response object.
 * @param {(value: unknown) => void} resolve - The resolve function of a Promise.
 * @param {(reason?: unknown) => void} reject - The reject function of a Promise.
 * @param {string} [url] - Optional URL for better error context.
 * @param {number} [maxSize] - Maximum response size in bytes.
 */
export const handleResponse = (res, resolve, reject, url, maxSize) => {
  const { statusCode } = res
  const contentType = res.headers['content-type']

  /** @type {string | undefined} */
  let err

  if (!statusCode || statusCode < 200 || statusCode >= 300) {
    err = `Request failed: ${statusCode ?? 'unknown'}`
    if (url) {
      err += `\nURL: ${url}`
    }
  }

  if (err) {
    /** @type {string[]} */
    const chunks = []
    res.setEncoding('utf8')
    res.on('data', chunk => chunks.push(chunk))
    res.on('end', () => {
      let errorMessage = err
      if (chunks.length > 0) {
        const body = chunks.join('')
        const truncated = body.substring(0, 200)
        const sanitized = truncated.replace(/(password|token|secret|key)=[^&]+/gi, '$1=***')
        errorMessage += `\nResponse body: ${sanitized}`
      }
      const error = /** @type {HttpError} */ (new Error(errorMessage))
      error.statusCode = statusCode
      reject(error)
    })
    return
  }

  /** @type {string[]} */
  const chunks = []
  let responseSize = 0
  res.setEncoding('utf8')
  res.on('data', chunk => {
    if (maxSize && responseSize + chunk.length > maxSize) {
      res.destroy()
      const error = /** @type {HttpError} */ (
        new Error(`Response size exceeds limit of ${maxSize} bytes${url ? ': ' + url : ''}`)
      )
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
      } catch (e) {
        reject(e)
        return
      }
    }

    resolve(rawData)
  })
}
