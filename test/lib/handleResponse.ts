import is from '@magic/types'
import {
  handleResponse,
  isResponseError,
  JsonParseError,
  HttpStatusError,
  SizeLimitError,
  NetworkError,
} from '../../src/lib/handleResponse.js'
import type { TestCase } from '../../src/types.js'

interface MockResponse {
  statusCode: number
  headers: { 'content-type': string }
  setEncoding: () => void
  on: (event: string, callback: (chunk?: string | Buffer) => void) => MockResponse
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
    on: (event: string, callback: (data?: string) => void) => {
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
    if (dataCallback) {
      dataCallback(data)
    }
    if (endCallback) {
      endCallback()
    }
    if (resolveWait) {
      resolveWait()
    }
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
        res,
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
        res,
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
        res,
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
        res,
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
        res,
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
        res,
        (v: unknown) => v,
        (e: unknown) => (error = e),
      )
      await wait
      return error
    },
    expect: is.error,
    info: 'rejects 500 status code',
  },
  {
    fn: async () => {
      const { res, wait } = createMockResponse(200, 'text/plain', 'test body')
      let capturedReject: (e: unknown) => void
      const promise = new Promise((_, reject) => {
        capturedReject = reject
      })
      handleResponse(
        res,
        (v: unknown) => v,
        (e: unknown) => capturedReject?.(e),
        undefined,
        5,
      )
      await wait
      try {
        await promise
        return false
      } catch {
        return true
      }
    },
    expect: (r: boolean) => r === true,
    info: 'rejects when response exceeds maxSize',
  },
  {
    fn: async () => {
      let result: unknown
      const { res, wait } = createMockResponse(200, 'application/json', '{"ok":true}')
      handleResponse(
        res,
        (v: unknown) => (result = v),
        (e: unknown) => e,
      )
      await wait
      return result
    },
    expect: { ok: true },
    info: 'handles 200 with JSON content type',
  },
  {
    fn: async () => {
      let result: unknown
      const { res, wait } = createMockResponse(200, '', '{"ignored":true}')
      handleResponse(
        res,
        (v: unknown) => (result = v),
        (e: unknown) => e,
      )
      await wait
      return result
    },
    expect: '{"ignored":true}',
    info: 'non-JSON content type returns raw string',
  },
  // Error with URL and body (lines 48-54)
  {
    fn: async () => {
      let error: unknown
      const { res, wait } = createMockResponse(404, 'text/plain', 'Not Found')
      handleResponse(
        res,
        (v: unknown) => v,
        (e: unknown) => (error = e),
        'https://example.com/api',
      )
      await wait
      return error
    },
    expect: (e: HttpStatusError) =>
      e instanceof HttpStatusError && e.message.includes('https://example.com/api'),
    info: 'error includes URL when provided',
  },
  {
    fn: async () => {
      let error: unknown
      const { res, wait } = createMockResponse(500, 'text/plain', 'Internal Server Error')
      handleResponse(
        res,
        (v: unknown) => v,
        (e: unknown) => (error = e),
        'https://api.example.com',
      )
      await wait
      return error
    },
    expect: (e: HttpStatusError) => e instanceof HttpStatusError && e.responseStatusCode === 500,
    info: 'HttpStatusError has correct status code',
  },
  {
    fn: async () => {
      let error: unknown
      const { res, wait } = createMockResponse(404, 'application/json', '{"error":"not found"}')
      handleResponse(
        res,
        (v: unknown) => v,
        (e: unknown) => (error = e),
      )
      await wait
      return error
    },
    expect: (e: HttpStatusError) => e instanceof HttpStatusError,
    info: 'handles JSON error response on non-2xx',
  },
  // JSON parse error
  {
    fn: async () => {
      let error: unknown
      const { res, wait } = createMockResponse(200, 'application/json', '{broken}')
      handleResponse(
        res,
        (v: unknown) => v,
        (e: unknown) => (error = e),
      )
      await wait
      return error
    },
    expect: (e: JsonParseError) => e instanceof JsonParseError,
    info: 'JsonParseError on invalid JSON',
  },
  // isResponseError type guard
  {
    fn: () => isResponseError(new JsonParseError('test')),
    expect: true,
    info: 'isResponseError returns true for JsonParseError',
  },
  {
    fn: () => isResponseError(new HttpStatusError('test', 404)),
    expect: true,
    info: 'isResponseError returns true for HttpStatusError',
  },
  {
    fn: () => isResponseError(new SizeLimitError('test')),
    expect: true,
    info: 'isResponseError returns true for SizeLimitError',
  },
  {
    fn: () => isResponseError(new NetworkError('test')),
    expect: true,
    info: 'isResponseError returns true for NetworkError',
  },
  {
    fn: () => isResponseError(new Error('not a response error')),
    expect: false,
    info: 'isResponseError returns false for regular Error',
  },
] satisfies TestCase[]
