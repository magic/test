import is from '@magic/types'
import { initGlobals } from '#lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new TransformStream(),
      expect: is.object,
      info: 'TransformStream is callable with new',
    },
    {
      fn: () => {
        const ts = new TransformStream()
        return ts.readable
      },
      expect: (v: unknown) => v !== null && v !== undefined,
      info: 'TransformStream has readable property',
    },
    {
      fn: () => {
        const ts = new TransformStream()
        return ts.writable
      },
      expect: (v: unknown) => v !== null && v !== undefined,
      info: 'TransformStream has writable property',
    },
    {
      fn: () => {
        const ts = new TransformStream()
        return is.object(ts) && 'readable' in ts && 'writable' in ts
      },
      expect: true,
      info: 'TransformStream has readable and writable properties',
    },
    {
      fn: () => {
        const ts = new TransformStream()
        return is.object(ts)
      },
      expect: true,
      info: 'TransformStream returns an object',
    },
  ],
}
