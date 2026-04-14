import http from 'node:http'
import { http as httpModule } from '../../src/lib/http.js'

interface TestGlobals {
  httpTestPort?: number
}

interface HttpResponse {
  success?: boolean
  method?: string
  body?: unknown
  status?: string
  error?: string
}

let server: http.Server

const beforeAll = async () => {
  return new Promise<void>(resolve => {
    server = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url === '/get') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, method: 'GET' }))
      } else if (req.method === 'GET' && req.url === '/created') {
        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'created' }))
      } else if (req.method === 'GET' && req.url === '/no-content') {
        res.writeHead(204)
        res.end()
      } else if (req.method === 'GET' && req.url === '/timeout') {
        setTimeout(() => {
          res.writeHead(200)
          res.end('late response')
        }, 5000)
      } else if (req.method === 'POST' && req.url === '/post') {
        let body = ''
        req.on('data', chunk => (body += chunk))
        req.on('end', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          let parsedBody: unknown
          try {
            parsedBody = JSON.parse(body)
          } catch {
            parsedBody = body
          }
          res.end(JSON.stringify({ success: true, method: 'POST', body: parsedBody }))
        })
      } else if (req.method === 'GET' && req.url === '/notfound') {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Not found' }))
      } else if (req.method === 'GET' && req.url === '/server-error') {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Server error' }))
      } else if (req.method === 'GET' && req.url === '/text') {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('plain text response')
      } else {
        res.writeHead(404)
        res.end()
      }
    })
    server.listen(0, () => {
      const addr = server.address() as { port: number }
      const g = globalThis as TestGlobals
      g.httpTestPort = addr.port
      resolve()
    })
  })
}

const afterAll = async () => {
  if (server) {
    server.close()
  }
  const g = globalThis as TestGlobals
  g.httpTestPort = undefined
}

export default {
  beforeAll,
  afterAll,
  tests: [
    {
      fn: async () => {
        const g = globalThis as TestGlobals
        const result = await httpModule.get(`http://localhost:${g.httpTestPort}/get`)
        return result
      },
      expect: (r: HttpResponse) => r.success === true && r.method === 'GET',
      info: 'http.get works',
    },
    {
      fn: async () => {
        const g = globalThis as TestGlobals
        const result = await httpModule.post(`http://localhost:${g.httpTestPort}/post`, {
          test: 'data',
        })
        return result
      },
      expect: (r: HttpResponse) =>
        r.success === true && r.body && (r.body as Record<string, unknown>).test === 'data',
      info: 'http.post works with JSON body',
    },
    {
      fn: async () => {
        const g = globalThis as TestGlobals
        const result = await httpModule.post(
          `http://localhost:${g.httpTestPort}/post`,
          'plain string',
        )
        return result
      },
      expect: (r: HttpResponse) => r.success === true && r.body === 'plain string',
      info: 'http.post works with string body',
    },
    {
      fn: async () => {
        let error: Error | null = null
        try {
          const g = globalThis as TestGlobals
          await httpModule.get(`http://localhost:${g.httpTestPort}/notfound`)
        } catch (e) {
          error = e as Error
        }
        return error ? error.message.includes('404') : false
      },
      expect: (r: boolean) => r === true,
      info: 'http.get rejects on 404',
    },
    {
      fn: async () => {
        let error: Error | null = null
        try {
          const g = globalThis as TestGlobals
          await httpModule.get(`http://localhost:${g.httpTestPort}/server-error`)
        } catch (e) {
          error = e as Error
        }
        return error ? error.message.includes('500') : false
      },
      expect: (r: boolean) => r === true,
      info: 'http.get rejects on 500',
    },
    {
      fn: async () => {
        let error: Error | null = null
        try {
          const g = globalThis as TestGlobals
          await httpModule.get(`http://localhost:${g.httpTestPort}/timeout`, {
            timeout: 100,
          })
        } catch (e) {
          error = e as Error
        }
        return error ? error.message.includes('timeout') : false
      },
      expect: (r: boolean) => r === true,
      info: 'http.get times out with custom timeout',
    },
    {
      fn: async () => {
        let error: Error | null = null
        try {
          await httpModule.get('not-a-valid-url')
        } catch (e) {
          error = e as Error
        }
        return error ? error.message.includes('Invalid URL') : false
      },
      expect: (r: boolean) => r === true,
      info: 'http.get throws on invalid URL',
    },
    {
      fn: async () => {
        let error: Error | null = null
        try {
          await httpModule.get('ftp://example.com')
        } catch (e) {
          error = e as Error
        }
        return error ? error.message.includes('Unsupported protocol') : false
      },
      expect: (r: boolean) => r === true,
      info: 'http.get throws on unsupported protocol',
    },
    {
      fn: async () => {
        let error: Error | null = null
        try {
          const g = globalThis as TestGlobals
          await httpModule.post(
            `http://localhost:${g.httpTestPort}/timeout`,
            { test: 'data' },
            { timeout: 100 },
          )
        } catch (e) {
          error = e as Error
        }
        return error ? error.message.includes('timeout') : false
      },
      expect: (r: boolean) => r === true,
      info: 'http.post times out with custom timeout',
    },
    {
      fn: async () => {
        const g = globalThis as TestGlobals
        const result = (await httpModule.post(
          `http://localhost:${g.httpTestPort}/post`,
          { test: 'https-reject' },
          { rejectUnauthorized: false },
        )) as { success?: boolean; body?: Record<string, unknown> }
        return result.success === true && result.body?.test === 'https-reject'
      },
      expect: (r: boolean) => r === true,
      info: 'http.post accepts rejectUnauthorized option',
    },
  ],
}
