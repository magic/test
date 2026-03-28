import http from 'node:http'

import { http as httpModule } from '../../src/lib/http.js'

let server

const beforeAll = async () => {
  return new Promise(resolve => {
    server = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url === '/get') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, method: 'GET' }))
      } else if (req.method === 'POST' && req.url === '/post') {
        let body = ''
        req.on('data', chunk => (body += chunk))
        req.on('end', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          let parsedBody
          try {
            parsedBody = JSON.parse(body)
          } catch {
            parsedBody = body
          }
          res.end(JSON.stringify({ success: true, method: 'POST', body: parsedBody }))
        })
      } else {
        res.writeHead(404)
        res.end()
      }
    })
    server.listen(0, () => {
      const port = server.address().port
      globalThis.httpTestPort = port
      resolve()
    })
  })
}

const afterAll = async () => {
  if (server) {
    server.close()
  }
  delete globalThis.httpTestPort
}

export default {
  beforeAll,
  afterAll,
  tests: [
    {
      fn: async () => {
        const result = await httpModule.get(`http://localhost:${globalThis.httpTestPort}/get`)
        return result
      },
      expect: r => r.success === true && r.method === 'GET',
      info: 'http.get works',
    },
    {
      fn: async () => {
        const result = await httpModule.post(`http://localhost:${globalThis.httpTestPort}/post`, {
          test: 'data',
        })
        return result
      },
      expect: r => r.success === true && r.body.test === 'data',
      info: 'http.post works with JSON body',
    },
    {
      fn: async () => {
        const result = await httpModule.post(
          `http://localhost:${globalThis.httpTestPort}/post`,
          'plain string',
        )
        return result
      },
      expect: r => r.success === true && r.body === 'plain string',
      info: 'http.post works with string body',
    },
  ],
}
