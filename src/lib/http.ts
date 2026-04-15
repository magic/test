import nodeHttp from 'node:http'
import nodeHttps from 'node:https'
import { URL } from 'node:url'

import { handleResponse } from './handleResponse.js'
import is from '@magic/types'

type BodyObject = Record<string, unknown>
type RequestBody = string | BodyObject

interface HttpOptions {
  timeout?: number
  rejectUnauthorized?: boolean
  maxSize?: number
  requestOptions?: nodeHttp.RequestOptions & nodeHttps.RequestOptions
}

/**
 * Determine if SSL certificate should be rejected.
 * Defaults to true (secure) unless MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED=false
 */
const shouldRejectUnauthorized = (): boolean => {
  const env = process.env.MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED
  if (env === undefined || env === 'true' || env === '1') return true
  if (env === 'false' || env === '0') return false
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
export const get = (url: string, options: HttpOptions = {}): Promise<unknown> => {
  if (!url || !is.string(url)) {
    throw new Error(`Invalid URL: ${url}`)
  }

  let parsedUrl: URL
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
 *
 * const result = await post('https://api.example.com/users', { name: 'John' })
 *
 * const result = await post('http://localhost:3000/data', 'raw string')
 *
 * const result = await post('https://self-signed.badssl.com', { data: 'test' }, { rejectUnauthorized: false })
 */
export const post = (
  url: string,
  body: RequestBody = '',
  options: HttpOptions = {},
): Promise<unknown> => {
  if (!url || !is.string(url)) {
    throw new Error(`Invalid URL: ${url}`)
  }

  let urlObject: URL
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

  const headers: Record<string, string | number> = {}

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
      const baseOptions = {
        hostname,
        port,
        path: pathname,
        method: 'POST',
        headers,
      }

      const requestOptions = isHttps ? { ...baseOptions, rejectUnauthorized } : baseOptions

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
