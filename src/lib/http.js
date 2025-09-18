import nodeHttp from 'node:http'
import nodeHttps from 'node:https'
import { Buffer } from 'node:buffer'
import util from 'node:util'

import { handleResponse } from './handleResponse.js'

export const get = url =>
  new Promise((resolve, reject) => {
    const connector = url.startsWith('https://') ? nodeHttps : nodeHttp

    try {
      /*
       * handleResponse will resolve or reject
       * the Promise this function returns above.
       */
      connector.get(url, res => handleResponse(res, resolve, reject))
    } catch (e) {
      throw e
    }
  })

export const post = (url, body = '') =>
  new Promise((resolve, reject) => {
    try {
      const urlObject = new URL(url)
      const connector = urlObject.protocol === 'https:' ? nodeHttps : nodeHttp

      const { protocol, hostname, port, pathname: path } = urlObject

      const options = {
        protocol,
        hostname,
        port,
        path,
        method: 'GET',
        headers: {},
        rejectUnauthorized: false,
      }

      if (body) {
        const postData = JSON.stringify(body)
        const byteLength = Buffer.byteLength(postData)
        headers['Content-Length'] = byteLength
        headers['Content-Type'] = 'application/json'
      }

      // console.log({ options })

      /*
       * handleResponse will resolve or reject
       * the Promise this function returns above.
       */
      const request = connector.request(options, res => handleResponse(res, resolve, reject))
      // console.log({ request })
    } catch (e) {
      throw e
    }
  })

export const http = {
  get,
  post,
}
