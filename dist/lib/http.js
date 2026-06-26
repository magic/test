import nodeHttp from 'node:http'
import nodeHttps from 'node:https'
import { URL } from 'node:url'
import { handleResponse } from './handleResponse.js'
import is from '@magic/types'
/**
 * Validate and parse a URL, returning the parsed URL and HTTPS flag.
 */
const parseUrl = url => {
  if (!url || !is.string(url)) {
    throw new Error(`Invalid URL: ${url}`)
  }
  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error(
      `Invalid URL format: "${url}". URL must be a valid absolute URL (e.g., https://example.com)`,
    )
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(
      `Unsupported protocol: "${parsedUrl.protocol}". Only http and https are supported.`,
    )
  }
  return { parsedUrl, isHttps: parsedUrl.protocol === 'https:' }
}
/**
 * Determine if SSL certificate should be rejected.
 * Defaults to true (secure) unless MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED=false
 */
const shouldRejectUnauthorized = () => {
  const env = process.env.MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED
  if (is.undefined(env) || env === 'true' || env === '1') {
    return true
  }
  if (env === 'false' || env === '0') {
    return false
  }
  return true // default secure
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
export const get = (url, options = {}) => {
  const { parsedUrl, isHttps } = parseUrl(url)
  const connector = isHttps ? nodeHttps : nodeHttp
  const timeout = options.timeout || 30000
  const rejectUnauthorized = options.rejectUnauthorized ?? shouldRejectUnauthorized()
  const maxSize = options.maxSize
  return new Promise((resolve, reject) => {
    try {
      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
      }
      if (isHttps) {
        Object.assign(requestOptions, { rejectUnauthorized })
      }
      const request = connector.request(requestOptions, res =>
        handleResponse(res, resolve, reject, url, maxSize),
      )
      request.setTimeout(timeout, () => {
        request.abort()
        reject(new Error(`Request timeout: ${url} (${timeout}ms)`))
      })
      request.on('error', reject)
    } catch (e) {
      reject(e)
    }
  })
}
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
export const post = (url, body = '', options = {}) => {
  const { parsedUrl, isHttps } = parseUrl(url)
  const connector = isHttps ? nodeHttps : nodeHttp
  const timeout = options.timeout || 30000
  const rejectUnauthorized = options.rejectUnauthorized ?? shouldRejectUnauthorized()
  const maxSize = options.maxSize
  const headers = {}
  let postData = ''
  if (body) {
    postData = is.str(body) ? body : JSON.stringify(body)
    headers['Content-Length'] = Buffer.byteLength(postData)
    headers['Content-Type'] = 'application/json'
  }
  return new Promise((resolve, reject) => {
    try {
      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers,
      }
      if (isHttps) {
        Object.assign(requestOptions, { rejectUnauthorized })
      }
      const request = connector.request(requestOptions, res =>
        handleResponse(res, resolve, reject, url, maxSize),
      )
      request.setTimeout(timeout, () => {
        request.abort()
        reject(new Error(`Request timeout: ${url} (${timeout}ms)`))
      })
      request.on('error', reject)
      if (postData) {
        request.write(postData)
      }
      request.end()
    } catch (e) {
      reject(e)
    }
  })
}
/**
 * HTTP utility object with get and post methods.
 */
export const http = {
  get,
  post,
}
