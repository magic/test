import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new TextEncoder(),
      expect: is.object,
      info: 'TextEncoder is callable with new',
    },
    {
      fn: () => {
        const enc = new TextEncoder()
        return enc.encode
      },
      expect: is.fn,
      info: 'TextEncoder has encode method',
    },
    {
      fn: () => {
        const enc = new TextEncoder()
        return (enc.encode('hello') as Uint8Array).constructor.name
      },
      expect: 'Uint8Array',
      info: 'TextEncoder.encode returns Uint8Array',
    },
    {
      fn: () => {
        const enc = new TextEncoder()
        return enc.encode('hello').length
      },
      expect: 5,
      info: 'TextEncoder.encode returns correct length',
    },
    {
      fn: () => {
        const enc = new TextEncoder()
        return enc.encoding
      },
      expect: 'utf-8',
      info: 'TextEncoder.encoding is utf-8',
    },
  ],
}
