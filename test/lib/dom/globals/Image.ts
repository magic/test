import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new Image(),
      expect: is.object,
      info: 'Image is callable with new',
    },
    {
      fn: () => {
        const img = new Image()
        return img.src
      },
      expect: '',
      info: 'Image.src is empty string by default',
    },
    {
      fn: () => {
        const img = new Image()
        return img.alt
      },
      expect: '',
      info: 'Image.alt is empty string by default',
    },
    {
      fn: () => {
        const img = new Image()
        return img.complete
      },
      expect: true,
      info: 'Image.complete is true by default',
    },
    {
      fn: () => {
        const img = new Image()
        return img.onload
      },
      expect: null,
      info: 'Image.onload is null by default',
    },
  ],
}
