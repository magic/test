import is from '@magic/types'
import { has } from '#lib/has.js'
import {
  handleResponse,
  parseHttpResponseContent,
  sanitizeBody,
  JsonParseError,
  HttpStatusError,
  SizeLimitError,
  NetworkError,
} from '#lib/handleResponse.js'
import type { TestCase } from '#src/types.js'

// Fake readable response stream with a controllable data/end emitter.
const makeRes = (
  opts: { statusCode?: number; headers?: Record<string, string | string[] | undefined> } = {},
) => {
  const { headers = {} } = opts
  const code = 'statusCode' in opts ? opts.statusCode : 200
  const handlers: Record<string, Array<(chunk?: string | Buffer) => void>> = {}
  const calls = { setEncoding: [] as string[], destroy: 0 }
  return {
    statusCode: code,
    headers: headers as Record<string, string | string[] | undefined>,
    setEncoding: (enc: BufferEncoding) => calls.setEncoding.push(enc),
    on: (event: string, cb: (chunk?: string | Buffer) => void) => {
      ;(handlers[event] ??= []).push(cb)
    },
    destroy: () => calls.destroy++,
    _calls: calls,
    _fire: (event: string, chunk?: string | Buffer) => {
      ;(handlers[event] ?? []).forEach(cb => cb(chunk))
    },
  }
}

type Outcome = { ok: boolean; value?: unknown; error?: Error }
const settle = (res: ReturnType<typeof makeRes>, opts: { url?: string; maxSize?: number } = {}) =>
  new Promise<Outcome>(resolve => {
    handleResponse(
      res as never,
      value => resolve({ ok: true, value }),
      reason => resolve({ ok: false, error: reason as Error }),
      opts.url,
      opts.maxSize,
    )
  })

const run = async (
  res: ReturnType<typeof makeRes>,
  chunks: Array<string | Buffer>,
  opts: { url?: string; maxSize?: number } = {},
) => {
  const settled = settle(res, opts)
  for (const c of chunks) {
    res._fire('data', c)
  }
  res._fire('end')
  return await settled
}

const describeError = (o: Outcome) => ({
  ok: o.ok,
  name: o.error?.constructor?.name ?? null,
  message: o.error?.message ?? null,
  status: (o.error as { responseStatusCode?: number })?.responseStatusCode ?? null,
  url: (o.error as { responseUrl?: string })?.responseUrl ?? null,
  body: (o.error as { responseBody?: string })?.responseBody ?? null,
  value: o.value,
})

const handleResponseTests: TestCase[] = [
  {
    fn: async () => {
      const res = makeRes({ statusCode: 200, headers: { 'content-type': 'application/json' } })
      const out = await run(res, ['{"a":1}'])
      return { ...describeError(out), setEncoding: res._calls.setEncoding }
    },
    expect: (v: { ok: boolean; value: unknown; setEncoding: string[] }) =>
      v.ok &&
      is.objectNative(v.value) &&
      (v.value as Record<string, unknown>).a === 1 &&
      v.setEncoding.includes('utf8'),
    info: 'handleResponse resolves parsed JSON on 2xx with content-type',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: 200, headers: {} })
      const p = settle(res)
      // fire an empty/falsy chunk (ignored) then a real one
      res._fire('data', '')
      res._fire('data', undefined)
      res._fire('data', 'hello')
      res._fire('end')
      return await p
    },
    expect: (v: { ok: boolean; value: unknown }) => v.ok && v.value === 'hello',
    info: 'handleResponse ignores empty data chunks in the success path',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: 201, headers: { 'content-type': 'text/html' } })
      return describeError(await run(res, ['hello']))
    },
    expect: (v: { ok: boolean; value: unknown }) => v.ok && v.value === 'hello',
    info: 'handleResponse resolves raw text for non-json content',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: 200, headers: { 'content-type': ['application/json'] } })
      return describeError(await run(res, ['{"a":1}']))
    },
    expect: (v: { ok: boolean; value: unknown }) => v.ok && v.value === '{"a":1}',
    info: 'handleResponse treats array content-type as raw text',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: 200, headers: { 'content-type': 'application/json' } })
      return describeError(await run(res, ['{oops']))
    },
    expect: (v: { ok: boolean; name: string | null }) => !v.ok && v.name === 'JsonParseError',
    info: 'handleResponse rejects JsonParseError on invalid JSON',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: 404, headers: {} })
      return describeError(await run(res, ['not found'], { url: 'http://x.com' }))
    },
    expect: (v: {
      ok: boolean
      name: string | null
      message: string | null
      status: number | null
      url: string | null
      body: string | null
    }) =>
      !v.ok &&
      v.name === 'HttpStatusError' &&
      v.status === 404 &&
      v.url === 'http://x.com' &&
      v.body === 'not found' &&
      v.message?.includes('404') &&
      v.message?.includes('not found'),
    info: 'handleResponse rejects HttpStatusError with url + body on error status',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: undefined, headers: {} })
      return describeError(await run(res, []))
    },
    expect: (v: {
      ok: boolean
      name: string | null
      message: string | null
      status: number | null
      body: string | null
    }) =>
      !v.ok &&
      v.name === 'HttpStatusError' &&
      v.status === 0 &&
      v.message?.includes('unknown') &&
      v.body === null,
    info: 'handleResponse reports unknown status and no body when statusCode is missing',
  },
  {
    fn: async () => {
      const low = await run(makeRes({ statusCode: 199, headers: {} }), [])
      const high = await run(makeRes({ statusCode: 300, headers: {} }), [])
      return { low: !low.ok, high: !high.ok }
    },
    expect: { low: true, high: true },
    info: 'handleResponse rejects 199 and 300 (boundaries of the 2xx range)',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: 200, headers: { 'content-type': 'text/html' } })
      const out = await run(res, ['12345678901'], { maxSize: 10, url: 'http://big' })
      return { ...describeError(out), destroyed: res._calls.destroy }
    },
    expect: (v: {
      ok: boolean
      name: string | null
      message: string | null
      destroyed: number
      url: string | null
    }) =>
      !v.ok &&
      v.name === 'SizeLimitError' &&
      v.destroyed > 0 &&
      v.message?.includes('10') &&
      v.url === 'http://big',
    info: 'handleResponse destroys the stream and rejects SizeLimitError when maxSize is exceeded',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: 200, headers: { 'content-type': 'text/html' } })
      return describeError(await run(res, [Buffer.from('hi'), 'there'], { maxSize: 100 }))
    },
    expect: (v: { ok: boolean; value: unknown }) => v.ok && v.value === 'hithere',
    info: 'handleResponse concatenates Buffer and string chunks within maxSize',
  },
  {
    fn: async () => {
      const res = makeRes({ statusCode: 403, headers: {} })
      return describeError(await run(res, ['password=leak'], { url: 'http://priv' }))
    },
    expect: (v: { ok: boolean; message: string | null }) =>
      !v.ok && v.message?.includes('password=***') && !v.message?.includes('leak'),
    info: 'handleResponse sanitizes sensitive values in error bodies',
  },
]

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
      return result.length
    },
    expect: 200,
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
      return e
    },
    expect: has.properties({ message: 'parse failed', responseStatusCode: 0 }),
    info: 'JsonParseError sets message and status',
  },
  {
    fn: () => {
      const e = new HttpStatusError('not found', 404, 'http://x.com', 'body')
      return e
    },
    expect: has.properties({
      message: 'not found',
      responseStatusCode: 404,
      responseUrl: 'http://x.com',
    }),
    info: 'HttpStatusError sets all properties',
  },
  {
    fn: () => {
      const e = new SizeLimitError('too large', 'http://x.com')
      return e.responseStatusCode
    },
    expect: 413,
    info: 'SizeLimitError has status 413',
  },
  {
    fn: () => {
      const e = new NetworkError('no connection', new Error('dns fail'))
      return e
    },
    expect: has.properties({
      responseStatusCode: 0,
      responseCause: (v: unknown) => v instanceof Error,
    }),
    info: 'NetworkError sets all properties',
  },

  // handleResponse — the main stream handler
  ...handleResponseTests,
]
