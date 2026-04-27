import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const { port1 } = new MessageChannel()
        return port1
      },
      expect: is.object,
      info: 'MessageChannel.port1 is accessible',
    },
    {
      fn: () => {
        const { port2 } = new MessageChannel()
        return port2
      },
      expect: is.object,
      info: 'MessageChannel.port2 is accessible',
    },
    {
      fn: () => {
        const { port1 } = new MessageChannel()
        return port1.postMessage
      },
      expect: is.fn,
      info: 'MessagePort has postMessage method',
    },
    {
      fn: () => {
        const { port1 } = new MessageChannel()
        return port1.start
      },
      expect: is.fn,
      info: 'MessagePort has start method',
    },
    {
      fn: () => {
        const { port1 } = new MessageChannel()
        return port1.close
      },
      expect: is.fn,
      info: 'MessagePort has close method',
    },
  ],
}
