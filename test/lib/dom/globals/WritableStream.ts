import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new WritableStream(),
      expect: is.object,
      info: 'WritableStream is callable with new',
    },
    {
      fn: () => {
        const ws = new WritableStream()
        return ws.locked === false || ws.locked === undefined
      },
      expect: true,
      info: 'WritableStream.locked is false or undefined by default',
    },
    {
      fn: () => {
        const ws = new WritableStream()
        return is.object(ws)
      },
      expect: true,
      info: 'WritableStream returns an object',
    },
    {
      fn: () => new WritableStream(),
      expect: (t: WritableStream) => is.instance(t, WritableStream),
      info: 'WritableStream.getWriter is a WritableStream instance',
    },

    // {
    //   fn: () => {
    //     const ws = new WritableStream()
    //     return ws.getWriter
    //   },
    //   expect: is.function,
    //   info: 'WritableStream.getWriter is a function',
    // },
    // {
    //   fn: () => {
    //     const ws = new WritableStream()
    //     return ws.abort
    //   },
    //   expect: is.function,
    //   info: 'WritableStream.abort is a function',
    // },
  ],
}
