import nodeHttp from 'node:http'
import nodeHttps from 'node:https'
import { URL } from 'node:url'

import { handleResponse } from './handleResponse.js'
import is from '@magic/types'

/**
 * @typedef {Record<string, unknown>} BodyObject
 * An object representing JSON request body data.
 */

/**
 * @typedef {string | BodyObject} RequestBody
 * Either a string or an object to be JSON-stringified.
 */

/**
 * @typedef {unknown} ResponseData
 * The parsed response data (could be JSON or string).
 */

/**
 * @typedef {Object} HttpOptions
 * @property {number} [timeout=30000] - Request timeout in milliseconds
 * @property {boolean} [rejectUnauthorized] - Whether to reject self-signed certs (default: true)
 * @property {number} [maxSize] - Maximum response size in bytes
 * @property {import('node:http').RequestOptions & import('node:https').RequestOptions} [requestOptions] - Extended options for http/https
 */

/**
 * Determine if SSL certificate should be rejected.
 * Defaults to true (secure) unless MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED=false
 * @returns {boolean}
 */
const shouldRejectUnauthorized = () => {
  const env = process.env.MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED
  if (env === undefined || env === 'true' || env === '1') return true
  if (env === 'false' || env === '0') return false
  return true // default secure
}

/**
 * Perform an HTTP GET request.
 * Automatically handles both HTTP and HTTPS protocols based on URL.
 *
 * @param {string} url - The URL to request.
 * @param {HttpOptions} [options] - Optional request options
 * @returns {Promise<ResponseData>} Resolves with the response data, rejects on error.
 *
 * @example
 * const data = await get('https://api.example.com/data')
 * console.log(data) // Parsed JSON or raw string
 *
 * @example
 * const data = await get('https://self-signed.badssl.com', { rejectUnauthorized: false })
 */
export const get = (url, options = {}) => {
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

  const isHttps = parsedUrl.protocol === 'https:'
  const connector = isHttps ? nodeHttps : nodeHttp
  const timeout = options.timeout || 30000
  const rejectUnauthorized = options.rejectUnauthorized ?? shouldRejectUnauthorized()
  const maxSize = options.maxSize

  return new Promise((resolve, reject) => {
    try {
      if (isHttps) {
        const request = connector.get(url, { rejectUnauthorized }, res =>
          handleResponse(res, resolve, reject, url, maxSize),
        )
        request.setTimeout(timeout, () => {
          request.abort()
          reject(new Error(`Request timeout: ${url} (${timeout}ms)`))
        })
        request.on('error', reject)
      } else {
        const request = connector.get(url, res =>
          handleResponse(res, resolve, reject, url, maxSize),
        )
        request.setTimeout(timeout, () => {
          request.abort()
          reject(new Error(`Request timeout: ${url} (${timeout}ms)`))
        })
        request.on('error', reject)
      }
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
 * @param {string} url - The URL to request.
 * @param {RequestBody} [body=''] - Request body. Will be JSON-stringified if an object.
 * @param {HttpOptions} [options] - Optional request options
 * @returns {Promise<ResponseData>} Resolves with the response data, rejects on error.
 *
 * @example
 * const result = await post('https://api.example.com/users', { name: 'John' })
 *
 * @example
 * const result = await post('http://localhost:3000/data', 'raw string')
 *
 * @example
 * const result = await post('https://self-signed.badssl.com', { data: 'test' }, { rejectUnauthorized: false })
 */
export const post = (url, body = '', options = {}) => {
  if (!url || !is.string(url)) {
    throw new Error(`Invalid URL: ${url}`)
  }

  let urlObject
  try {
    urlObject = new URL(url)
  } catch {
    throw new Error(
      `Invalid URL format: "${url}". URL must be a valid absolute URL (e.g., https://example.com)`,
    )
  }

  if (!['http:', 'https:'].includes(urlObject.protocol)) {
    throw new Error(
      `Unsupported protocol: "${urlObject.protocol}". Only http and https are supported.`,
    )
  }

  const isHttps = urlObject.protocol === 'https:'
  const connector = isHttps ? nodeHttps : nodeHttp

  const { hostname, port, pathname } = urlObject

  /** @type {Record<string, string | number>} */
  const headers = {}

  const timeout = options.timeout || 30000
  const rejectUnauthorized = options.rejectUnauthorized ?? shouldRejectUnauthorized()
  const maxSize = options.maxSize

  let postData = ''
  if (body) {
    postData = is.str(body) ? body : JSON.stringify(body)
    headers['Content-Length'] = Buffer.byteLength(postData)
    headers['Content-Type'] = 'application/json'
  }

  return new Promise((resolve, reject) => {
    try {
      const requestOptions = {
        hostname,
        port,
        path: pathname,
        method: 'POST',
        headers,
      }

      // Include rejectUnauthorized for HTTPS requests
      if (isHttps) {
        /** @type {import('node:https').RequestOptions} */
        ;(requestOptions).rejectUnauthorized = rejectUnauthorized
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
 * @type {{ get: (url: string, options?: HttpOptions) => Promise<ResponseData>, post: (url: string, body?: RequestBody, options?: HttpOptions) => Promise<ResponseData> }}
 */
export const http = {
  get,
  post,
}
