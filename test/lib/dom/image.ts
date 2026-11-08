import { parsePngDimensions, createImagePolyfill } from '#lib/dom/image.js'
import { initGlobals } from '#lib/dom/globals.js'
import type { TestCase } from '#src/types.js'

const getWin = () => (globalThis as { window?: { Event: new (t: string) => unknown } }).window

export default [
  // parsePngDimensions
  {
    fn: () => parsePngDimensions('data:image/png;base64,'),
    expect: { width: 1, height: 1 },
    info: 'empty base64 returns 1x1',
  },
  {
    fn: () => parsePngDimensions('not-a-data-url'),
    expect: { width: 1, height: 1 },
    info: 'non-data URL returns 1x1',
  },
  {
    fn: () => parsePngDimensions(''),
    expect: { width: 1, height: 1 },
    info: 'empty string returns 1x1',
  },
  {
    fn: () => parsePngDimensions('data:image/png;base64,AA=='),
    expect: { width: 1, height: 1 },
    info: 'too short base64 returns 1x1',
  },
  {
    fn: () =>
      parsePngDimensions(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      ),
    expect: { width: 1, height: 1 },
    info: 'valid 1x1 PNG returns 1x1',
  },
  {
    fn: () => {
      const result = parsePngDimensions(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAICAIAAADZnw1bAAAAHElEQVQ4y2P8z8DwAFFEJTBmAMrwHAxGgxGKBhQAABNhAAe7qKfIAAAAASUVORK5CYII=',
      )
      return result.width > 0 && result.height > 0
    },
    expect: true,
    info: 'valid PNG returns positive dimensions',
  },
  {
    fn: () => parsePngDimensions('data:image/jpeg;base64,/9j/4AAQ'),
    expect: { width: 1, height: 1 },
    info: 'non-PNG mime type returns 1x1',
  },
  {
    fn: () => parsePngDimensions('data:image/png;base64,AAAA'),
    expect: { width: 1, height: 1 },
    info: 'valid header but zero dimensions returns 1x1',
  },
  {
    fn: () => {
      const result = parsePngDimensions(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkYGD4z8BAAowMDAz/YzUzMjKiVAFqLxgYGP4zMDAw4BowMjKiVAGjDgIwYQAAGkYB/yY7xEAAAAAASUVORK5CYII=',
      )
      return result.width > 0 && result.height > 0
    },
    expect: true,
    info: 'another valid PNG returns positive dimensions',
  },
  {
    fn: () => parsePngDimensions('data:image/png;base64,!!!!'),
    expect: { width: 1, height: 1 },
    info: 'invalid base64 falls back to 1x1 via catch',
  },
  // createImagePolyfill
  {
    fn: async () => {
      initGlobals()
      const win = getWin()!
      const PolyImage = createImagePolyfill(win as never)
      const img = new PolyImage() as {
        src: string
        width: number
        height: number
        complete: boolean
        dispatchEvent: (e: unknown) => boolean
      }
      img.src = 'http://example.com/pic.png'
      return {
        src: img.src,
        width: img.width,
        dispatch: img.dispatchEvent(new win.Event('load')),
        isProto: Object.getPrototypeOf(img) === PolyImage.prototype,
      }
    },
    expect: (v: { src: string; width: number; dispatch: boolean; isProto: boolean }) =>
      v.src === 'http://example.com/pic.png' && v.width === 0 && v.dispatch === true && v.isProto,
    info: 'polyfilled image stores non-data URLs via the original src setter',
  },
  {
    fn: async () => {
      initGlobals()
      const win = getWin()!
      const PolyImage = createImagePolyfill(win as never)
      const img = new PolyImage() as {
        src: string
        width: number
        height: number
        complete: boolean
        onload: ((e: unknown) => void) | null
        _nodeCanvasImage?: unknown
      }
      let loaded = 0
      img.onload = () => loaded++
      img.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAICAIAAADZnw1bAAAAHElEQVQ4y2P8z8DwAFFEJTBmAMrwHAxGgxGKBhQAABNhAAe7qKfIAAAAASUVORK5CYII='
      for (let i = 0; i < 50 && loaded === 0; i++) {
        await new Promise(r => setTimeout(r, 20))
      }
      return {
        width: img.width,
        height: img.height,
        complete: img.complete,
        loaded,
        hasNode: !!img._nodeCanvasImage,
        srcReadsBack: img.src.startsWith('data:image/png'),
      }
    },
    expect: (v: {
      width: number
      height: number
      complete: boolean
      loaded: number
      hasNode: boolean
      srcReadsBack: boolean
    }) =>
      v.width === 40 &&
      v.height === 8 &&
      v.complete === true &&
      v.loaded === 1 &&
      typeof v.hasNode === 'boolean' &&
      v.srcReadsBack,
    info: 'polyfilled image sets parsed dimensions + complete and fires onload for a valid PNG data URL',
  },
  {
    fn: async () => {
      initGlobals()
      const win = getWin()!
      const PolyImage = createImagePolyfill(win as never)
      const img = new PolyImage() as {
        src: string
        width: number
        height: number
        onload: ((e: unknown) => void) | null
        _nodeCanvasImage?: unknown
      }
      let loaded = 0
      img.onload = () => loaded++
      img.src = 'data:image/svg+xml,notapng'
      for (let i = 0; i < 50 && loaded === 0; i++) {
        await new Promise(r => setTimeout(r, 20))
      }
      return { width: img.width, height: img.height, loaded, hasNode: !!img._nodeCanvasImage }
    },
    expect: (v: { width: number; height: number; loaded: number; hasNode: boolean }) =>
      v.width === 1 && v.height === 1 && v.loaded === 1 && v.hasNode === false,
    info: 'polyfilled image falls back to 1x1 and still fires onload when the data URL is not loadable',
  },
  {
    fn: async () => {
      initGlobals()
      const win = getWin()!
      const PolyImage = createImagePolyfill(win as never)
      const img = new PolyImage() as {
        addEventListener: (t: string, l: unknown) => void
        src: string
      }
      img.addEventListener('load', () => undefined)
      img.src = 'data:image/png;base64,!!!!'
      return 'no-throw'
    },
    expect: 'no-throw',
    info: 'polyfilled image addEventListener is a safe no-op',
  },
] satisfies TestCase[]
