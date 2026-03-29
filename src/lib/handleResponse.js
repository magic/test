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
 */
export const handleResponse = (res, resolve, reject, url) => {
  const { statusCode } = res
  const contentType = res.headers['content-type']

  /** @type {string | undefined} */
  let err

  // Accept any 2xx status code as successful
  if (!statusCode || statusCode < 200 || statusCode >= 300) {
    err = `Request failed: ${statusCode ?? 'unknown'}`
    if (url) {
      err += `\nURL: ${url}`
    }
  }

  if (err) {
    // Collect response body for error context
    let body = ''
    res.setEncoding('utf8')
    res.on('data', chunk => {
      body += chunk
    })
    res.on('end', () => {
      let errorMessage = err
      if (body) {
        errorMessage += `\nResponse body: ${body.substring(0, 500)}`
      }
      const error = /** @type {HttpError} */ (new Error(errorMessage))
      error.statusCode = statusCode
      reject(error)
    })
    return // ensure we stop processing
  }

  res.setEncoding('utf8')

  let rawData = ''

  res.on('data', chunk => {
    rawData += chunk
  })

  res.on('end', () => {
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
