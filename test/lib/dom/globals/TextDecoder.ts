import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new TextDecoder(),
      expect: is.object,
      info: 'TextDecoder is callable with new',
    },
    {
      fn: () => {
        const dec = new TextDecoder()
        return dec.decode
      },
      expect: is.fn,
      info: 'TextDecoder has decode method',
    },
    {
      fn: () => {
        const dec = new TextDecoder()
        const buf = new Uint8Array([104, 101, 108, 108, 111])
        return dec.decode(buf)
      },
      expect: 'hello',
      info: 'TextDecoder.decode decodes correctly',
    },
    {
      fn: () => {
        const dec = new TextDecoder()
        return dec.encoding
      },
      expect: 'utf-8',
      info: 'TextDecoder.encoding is utf-8',
    },
    {
      fn: () => {
        const dec = new TextDecoder('utf-8')
        return dec.encoding
      },
      expect: 'utf-8',
      info: 'TextDecoder can be created with encoding',
    },
  ],
}
