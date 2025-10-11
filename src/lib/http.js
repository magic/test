import nodeHttp from 'node:http'
import nodeHttps from 'node:https'
import { Buffer } from 'node:buffer'
import { URL } from 'node:url'

import { handleResponse } from './handleResponse.js'

/**
 * @typedef {Record<string, any>} BodyObject
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
 * Perform an HTTP GET request.
 * Automatically handles both HTTP and HTTPS protocols based on URL.
 *
 * @param {string} url - The URL to request.
 * @returns {Promise<ResponseData>} Resolves with the response data, rejects on error.
 *
 * @example
 * const data = await get('https://api.example.com/data')
 * console.log(data) // Parsed JSON or raw string
 */
export const get = url =>
  new Promise((resolve, reject) => {
    const connector = url.startsWith('https://') ? nodeHttps : nodeHttp

    try {
      connector.get(url, res => handleResponse(res, resolve, reject))
    } catch (e) {
      reject(e)
    }
  })

/**
 * Perform an HTTP POST request with optional JSON body.
 * Automatically handles both HTTP and HTTPS protocols based on URL.
 * Sets appropriate Content-Type and Content-Length headers for JSON.
 *
 * @param {string} url - The URL to request.
 * @param {RequestBody} [body=''] - Request body. Will be JSON-stringified if an object.
 * @returns {Promise<ResponseData>} Resolves with the response data, rejects on error.
 *
 * @example
 * const result = await post('https://api.example.com/users', { name: 'John' })
 *
 * @example
 * const result = await post('http://localhost:3000/data', 'raw string')
 */
export const post = (url, body = '') =>
  new Promise((resolve, reject) => {
    try {
      const urlObject = new URL(url)
      const connector = urlObject.protocol === 'https:' ? nodeHttps : nodeHttp

      const { protocol, hostname, port, pathname: path } = urlObject

      /** @type {Record<string, string | number>} */
      const headers = {}

      let postData = ''
      if (body) {
        postData = typeof body === 'string' ? body : JSON.stringify(body)
        headers['Content-Length'] = Buffer.byteLength(postData)
        headers['Content-Type'] = 'application/json'
      }

      const options = {
        protocol,
        hostname,
        port,
        path,
        method: 'POST',
        headers,
        rejectUnauthorized: false,
      }

      const request = connector.request(options, res => handleResponse(res, resolve, reject))

      if (postData) {
        request.write(postData)
      }

      request.end()
    } catch (e) {
      reject(e)
    }
  })

/**
 * HTTP utility object with get and post methods.
 * @type {{ get: (url: string) => Promise<ResponseData>, post: (url: string, body?: RequestBody) => Promise<ResponseData> }}
 */
export const http = {
  get,
  post,
}
