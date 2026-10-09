import is from '@magic/types'
import {
  parseHttpResponseContent,
  sanitizeBody,
  JsonParseError,
  HttpStatusError,
  SizeLimitError,
  NetworkError,
} from '#lib/handleResponse.js'

export default [
  // parseHttpResponseContent
  {
    fn: () => parseHttpResponseContent('{"name":"test"}', 'application/json'),
    expect: (r: unknown) => is.objectNative(r) && (r as Record<string, unknown>).name === 'test',
    info: 'parses JSON content when content-type is application/json',
  },
  {
    fn: () => parseHttpResponseContent('plain text', undefined),
    expect: 'plain text',
    info: 'returns raw string when content-type is undefined',
  },
  {
    fn: () => parseHttpResponseContent('{}', 'text/html'),
    expect: '{}',
    info: 'returns raw string when content-type is not application/json',
  },
  {
    fn: () => parseHttpResponseContent('null', 'application/json'),
    expect: null,
    info: 'parses null JSON value',
  },
  {
    fn: () => parseHttpResponseContent('42', 'application/json'),
    expect: 42,
    info: 'parses JSON number',
  },
  {
    fn: () => parseHttpResponseContent('["a","b"]', 'application/json'),
    expect: (r: unknown) => is.array(r) && (r as string[]).length === 2,
    info: 'parses JSON array',
  },
  // sanitizeBody
  {
    fn: () => sanitizeBody('normal text'),
    expect: 'normal text',
    info: 'returns unmodified text without sensitive data',
  },
  {
    fn: () => sanitizeBody('password=secret123'),
    expect: 'password=***',
    info: 'redacts password from body text',
  },
  {
    fn: () => sanitizeBody('token=abc&secret=xyz&key=123'),
    expect: 'token=***&secret=***&key=***',
    info: 'redacts all sensitive key=value pairs',
  },
  {
    fn: () => {
      const body = 'a'.repeat(300)
      const result = sanitizeBody(body)
      return result.length === 200
    },
    expect: true,
    info: 'truncates body to 200 chars',
  },
  {
    fn: () => sanitizeBody('password=abc&normal=text&token=xyz&more=data'),
    expect: (r: string) => r.includes('password=***') && r.includes('token=***') && r.length < 50,
    info: 'handles multiple sensitive and normal parts',
  },
  // Error classes
  {
    fn: () => {
      const e = new JsonParseError('parse failed', new Error('cause'))
      return e.message === 'parse failed' && e.responseStatusCode === 0
    },
    expect: true,
    info: 'JsonParseError sets message and status',
  },
  {
    fn: () => {
      const e = new HttpStatusError('not found', 404, 'http://x.com', 'body')
      return (
        e.message === 'not found' &&
        e.responseStatusCode === 404 &&
        e.responseUrl === 'http://x.com'
      )
    },
    expect: true,
    info: 'HttpStatusError sets all properties',
  },
  {
    fn: () => {
      const e = new SizeLimitError('too large', 'http://x.com')
      return e.responseStatusCode === 413
    },
    expect: true,
    info: 'SizeLimitError has status 413',
  },
  {
    fn: () => {
      const e = new NetworkError('no connection', new Error('dns fail'))
      return e.responseStatusCode === 0 && e.responseCause instanceof Error
    },
    expect: true,
    info: 'NetworkError sets all properties',
  },
]
