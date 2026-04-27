import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new ReadableStream(),
      expect: is.object,
      info: 'ReadableStream is callable with new',
    },
    {
      fn: () => {
        const rs = new ReadableStream()
        return rs.getReader
      },
      expect: is.fn,
      info: 'ReadableStream has getReader method',
    },
    {
      fn: () => {
        const rs = new ReadableStream()
        return rs.pipeThrough
      },
      expect: is.fn,
      info: 'ReadableStream has pipeThrough method',
    },
    {
      fn: () => {
        const rs = new ReadableStream()
        return rs.pipeTo
      },
      expect: is.fn,
      info: 'ReadableStream has pipeTo method',
    },
    {
      fn: () => {
        const rs = new ReadableStream()
        return rs.locked
      },
      expect: false,
      info: 'ReadableStream.locked is false by default',
    },
  ],
}
