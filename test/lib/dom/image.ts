import { parsePngDimensions, createImagePolyfill } from '../../../src/lib/dom/image.js'
import type { TestCase } from '../../../src/types.js'

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

  // createImagePolyfill
  {
    fn: () => {
      const win = globalThis as any
      if (!win.Window) {
        win.Window = function () {}
        win.Window.prototype = {}
        win.Event = class Event {
          constructor(_type: string) {}
        }
      }
      if (!win.Document) {
        win.Document = function () {}
      }
      if (!win.HTMLImageElement) {
        win.HTMLImageElement = class HTMLImageElement {
          prototype: any
          constructor() {}
        }
        win.HTMLImageElement.prototype = {}
        win.Image = win.HTMLImageElement
      }
      const PolyfilledImage = createImagePolyfill(win as any)
      return typeof PolyfilledImage === 'function'
    },
    expect: true,
    info: 'createImagePolyfill returns a constructor function',
  },
  {
    fn: () => {
      const win = globalThis as any
      if (!win.Window) {
        win.Window = function () {}
        win.Window.prototype = {}
        win.Event = class Event {
          constructor(_type: string) {}
        }
      }
      if (!win.Document) {
        win.Document = function () {}
      }
      if (!win.HTMLImageElement) {
        win.HTMLImageElement = class HTMLImageElement {
          prototype: any
          src: string = ''
          width: number = 0
          height: number = 0
          complete: boolean = false
          onload: (() => void) | null = null
          addEventListener: () => void = () => {}
          dispatchEvent: () => boolean = () => true
          constructor() {
            this.src = ''
          }
        }
        win.HTMLImageElement.prototype = {
          get src() {
            return ''
          },
          set src(_v: string) {},
        }
        win.Image = win.HTMLImageElement
      }
      const PolyfilledImage = createImagePolyfill(win as any)
      const img = new (PolyfilledImage as any)()
      return img instanceof PolyfilledImage
    },
    expect: true,
    info: 'polyfilled image instanceof works',
  },
  {
    fn: () => {
      const win = globalThis as any
      if (!win.Window) {
        win.Window = function () {}
        win.Window.prototype = {}
        win.Event = class Event {
          constructor(_type: string) {}
        }
      }
      if (!win.Document) {
        win.Document = function () {}
      }
      if (!win.HTMLImageElement) {
        win.HTMLImageElement = class HTMLImageElement {
          prototype: any
          src: string = ''
          constructor() {}
        }
        win.HTMLImageElement.prototype = {}
        win.Image = win.HTMLImageElement
      }
      const PolyfilledImage = createImagePolyfill(win as any)
      const img = new (PolyfilledImage as any)()
      // Set data URL src
      img.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      return img.width > 0 && img.height > 0
    },
    expect: true,
    info: 'polyfilled image with data URL sets dimensions',
  },
  {
    fn: () => {
      const win = globalThis as any
      if (!win.Window) {
        win.Window = function () {}
        win.Window.prototype = {}
        win.Event = class Event {
          constructor(_type: string) {}
        }
      }
      if (!win.Document) {
        win.Document = function () {}
      }
      if (!win.HTMLImageElement) {
        win.HTMLImageElement = class HTMLImageElement {
          prototype: any
          src: string = ''
          constructor() {}
        }
        win.HTMLImageElement.prototype = {}
        win.Image = win.HTMLImageElement
      }
      const PolyfilledImage = createImagePolyfill(win as any)
      const img = new (PolyfilledImage as any)()
      // Non-data URL should fall through
      img.src = 'https://example.com/image.png'
      return img.src === 'https://example.com/image.png'
    },
    expect: true,
    info: 'polyfilled image with http URL preserves src',
  },
] satisfies TestCase[]
