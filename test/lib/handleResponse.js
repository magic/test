import is from '@magic/types'

import { handleResponse } from '../../src/lib/handleResponse.js'

const createMockResponse = (statusCode, contentType, data) => {
  let resolveWait
  const wait = new Promise(r => (resolveWait = r))
  let dataCallback
  let endCallback
  const res = {
    statusCode,
    headers: { 'content-type': contentType },
    setEncoding: () => {},
    on: (event, callback) => {
      if (event === 'data') {
        dataCallback = callback
      } else if (event === 'end') {
        endCallback = callback
      }
      return res
    },
    resume: () => {},
  }
  setTimeout(() => {
    if (dataCallback) dataCallback(data)
    if (endCallback) endCallback()
    if (resolveWait) resolveWait()
  }, 0)
  return { res, wait }
}

export default [
  {
    fn: () => handleResponse,
    expect: is.fn,
    info: 'handleResponse is a function',
  },
  {
    fn: async () => {
      let result
      const { res, wait } = createMockResponse(200, 'application/json', '{"a":1}')
      handleResponse(
        res,
        v => (result = v),
        e => e,
      )
      await wait
      return result
    },
    expect: { a: 1 },
    info: 'handles JSON response with 200 status',
  },
  {
    fn: async () => {
      let error
      const { res, wait } = createMockResponse(404, 'application/json', '{}')
      handleResponse(
        res,
        v => v,
        e => (error = e),
      )
      await wait
      return error
    },
    expect: is.string,
    info: 'rejects non-200 status code',
  },
  {
    fn: async () => {
      let result
      const { res, wait } = createMockResponse(200, 'text/plain', 'hello world')
      handleResponse(
        res,
        v => (result = v),
        e => e,
      )
      await wait
      return result
    },
    expect: 'hello world',
    info: 'handles non-JSON response',
  },
  {
    fn: async () => {
      let error
      const { res, wait } = createMockResponse(200, 'application/json', 'invalid json')
      handleResponse(
        res,
        v => v,
        e => (error = e),
      )
      await wait
      return error
    },
    expect: is.error,
    info: 'rejects invalid JSON',
  },
  {
    fn: async () => {
      let result
      const { res, wait } = createMockResponse(201, 'application/json', '{"created":true}')
      handleResponse(
        res,
        v => (result = v),
        e => e,
      )
      await wait
      return result
    },
    expect: { created: true },
    info: 'accepts 201 status code (Created)',
  },
  {
    fn: async () => {
      let error
      const { res, wait } = createMockResponse(500, 'text/plain', 'Server Error')
      handleResponse(
        res,
        v => v,
        e => (error = e),
      )
      await wait
      return error
    },
    expect: is.string,
    info: 'rejects 500 status code',
  },
]
