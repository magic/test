import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.HTMLCanvasElement,
      expect: is.fn,
      info: 'HTMLCanvasElement is a constructor',
    },
    {
      fn: () => {
        const canvas = globalThis.document.createElement('canvas')
        return is.instance(canvas, globalThis.HTMLCanvasElement)
      },
      expect: true,
      info: 'Canvas element is instance of HTMLCanvasElement',
    },
    {
      fn: () => {
        const canvas = globalThis.document.createElement('canvas')
        return canvas.getContext
      },
      expect: is.fn,
      info: 'HTMLCanvasElement has getContext method',
    },
    {
      fn: () => {
        const canvas = globalThis.document.createElement('canvas')
        return canvas.toDataURL
      },
      expect: is.fn,
      info: 'HTMLCanvasElement has toDataURL method',
    },
    {
      fn: () => {
        const canvas = globalThis.document.createElement('canvas')
        return canvas.width
      },
      expect: (t: number) => t === 300,
      info: 'HTMLCanvasElement width defaults to 300',
    },
  ],
}
