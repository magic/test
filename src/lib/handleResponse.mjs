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
    res.resume()
    reject(err)
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
      } catch (e) {
        reject(e)
      }
    }

    resolve(rawData)
  })
}