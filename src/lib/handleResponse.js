/**
 * Handles an HTTP response, collecting data and resolving or rejecting a promise.
 *
 * @param {import('http').IncomingMessage} res - The HTTP response object.
 * @param {(value: unknown) => void} resolve - The resolve function of a Promise.
 * @param {(reason?: unknown) => void} reject - The reject function of a Promise.
 */
export const handleResponse = (res, resolve, reject) => {
  const { statusCode } = res
  const contentType = res.headers['content-type']

  let err
  // Any 2xx status code signals a successful response but
  // here we're only checking for 200.
  if (statusCode !== 200) {
    err = 'Request Failed.\n' + `Status Code: ${statusCode}`
  }

  if (err) {
    res.resume() // consume response data to free memory
    reject(err)
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
