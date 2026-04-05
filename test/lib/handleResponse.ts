import is from '@magic/types'
import { handleResponse } from '../../src/lib/handleResponse.js'

interface MockResponse {
  statusCode: number
  headers: { 'content-type': string }
  setEncoding: () => void
  on: (event: string, callback: (data?: any) => void) => MockResponse
  resume: () => void
}

const createMockResponse = (
  statusCode: number,
  contentType: string,
  data: string,
): { res: MockResponse; wait: Promise<void> } => {
  let resolveWait: (() => void) | undefined
  const wait = new Promise<void>(r => (resolveWait = r))
  let dataCallback: ((data: string) => void) | undefined
  let endCallback: (() => void) | undefined
  const res: MockResponse = {
    statusCode,
    headers: { 'content-type': contentType },
    setEncoding: () => {},
    on: (event: string, callback: (data?: any) => void) => {
      if (event === 'data') {
        dataCallback = () => callback(data)
      } else if (event === 'end') {
        endCallback = () => callback()
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
      let result: unknown
      const { res, wait } = createMockResponse(200, 'application/json', '{"a":1}')
      handleResponse(
        res as any,
        (v: unknown) => (result = v),
        (e: unknown) => e,
      )
      await wait
      return result
    },
    expect: { a: 1 },
    info: 'handles JSON response with 200 status',
  },
  {
    fn: async () => {
      let error: unknown
      const { res, wait } = createMockResponse(404, 'application/json', '{}')
      handleResponse(
        res as any,
        (v: unknown) => v,
        (e: unknown) => (error = e),
      )
      await wait
      return error
    },
    expect: is.error,
    info: 'rejects non-200 status code',
  },
  {
    fn: async () => {
      let result: unknown
      const { res, wait } = createMockResponse(200, 'text/plain', 'hello world')
      handleResponse(
        res as any,
        (v: unknown) => (result = v),
        (e: unknown) => e,
      )
      await wait
      return result
    },
    expect: 'hello world',
    info: 'handles non-JSON response',
  },
  {
    fn: async () => {
      let error: unknown
      const { res, wait } = createMockResponse(200, 'application/json', 'invalid json')
      handleResponse(
        res as any,
        (v: unknown) => v,
        (e: unknown) => (error = e),
      )
      await wait
      return error
    },
    expect: is.error,
    info: 'rejects invalid JSON',
  },
  {
    fn: async () => {
      let result: unknown
      const { res, wait } = createMockResponse(201, 'application/json', '{"created":true}')
      handleResponse(
        res as any,
        (v: unknown) => (result = v),
        (e: unknown) => e,
      )
      await wait
      return result
    },
    expect: { created: true },
    info: 'accepts 201 status code (Created)',
  },
  {
    fn: async () => {
      let error: unknown
      const { res, wait } = createMockResponse(500, 'text/plain', 'Server Error')
      handleResponse(
        res as any,
        (v: unknown) => v,
        (e: unknown) => (error = e),
      )
      await wait
      return error
    },
    expect: is.error,
    info: 'rejects 500 status code',
  },
]
