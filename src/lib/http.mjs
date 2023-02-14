import nodeHttp from 'http'
import nodeHttps from 'https'

import { handleResponse } from './handleResponse.mjs'

export const get = url =>
  new Promise((resolve, reject) => {
    const connector = url.startsWith('https://') ? nodeHttps : nodeHttp

    try {
      connector.get(url, res => handleResponse(res, resolve, reject))
    } catch (e) {
      throw e
    }
  })

export const http = {
  get,
}

export default http
