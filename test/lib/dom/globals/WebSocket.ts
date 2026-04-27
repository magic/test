import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new WebSocket('ws://localhost'),
      expect: is.object,
      info: 'WebSocket is callable with new',
    },
    {
      fn: () => {
        const ws = new WebSocket('ws://localhost')
        return ws.close
      },
      expect: is.fn,
      info: 'WebSocket has close method',
    },
    {
      fn: () => {
        const ws = new WebSocket('ws://localhost')
        return ws.send
      },
      expect: is.fn,
      info: 'WebSocket has send method',
    },
    {
      fn: () => {
        const ws = new WebSocket('ws://localhost')
        return ws.url.includes('localhost')
      },
      expect: true,
      info: 'WebSocket has url property with localhost',
    },
    {
      fn: () => {
        const ws = new WebSocket('ws://localhost')
        return ws.readyState
      },
      expect: 0,
      info: 'WebSocket.readyState is 0 (CONNECTING) by default',
    },
  ],
}
