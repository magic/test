import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new Audio(),
      expect: is.object,
      info: 'Audio is callable with new',
    },
    {
      fn: () => {
        const audio = new Audio()
        return audio.play
      },
      expect: is.fn,
      info: 'Audio has play method',
    },
    {
      fn: () => {
        const audio = new Audio()
        return audio.pause
      },
      expect: is.fn,
      info: 'Audio has pause method',
    },
    {
      fn: () => {
        const audio = new Audio()
        return audio.load
      },
      expect: is.fn,
      info: 'Audio has load method',
    },
    {
      fn: () => {
        const audio = new Audio()
        return audio.volume
      },
      expect: 1,
      info: 'Audio.volume is 1 by default',
    },
  ],
}
