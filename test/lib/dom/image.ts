import { parsePngDimensions, createImagePolyfill } from '../../../src/lib/dom/image.js'
import type { TestCase } from '../../../src/types.d.js'
import type { Window } from 'happy-dom'

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
      // Create a minimal mock window with all required properties
      const mockWin = {
        Window: function MockWindow() {} as unknown as { new (): object; prototype: object },
        Document: function MockDocument() {} as unknown as { new (): object },
        HTMLImageElement: function MockHTMLImageElement() {} as unknown as {
          new (): { prototype: object }
        },
        Event: class MockEvent {
          constructor(_type: string) {}
        },
      } as unknown as Window
      const PolyfilledImage = createImagePolyfill(mockWin)
      return typeof PolyfilledImage === 'function'
    },
    expect: true,
    info: 'createImagePolyfill returns a constructor function',
  },
  {
    fn: () => {
      const mockImgCtor = function MockHTMLImageElement() {} as unknown as {
        new (): { prototype: { get src(): string; set src(v: string) }; src: string }
      }
      mockImgCtor.prototype = {
        get src() { return '' },
        set src(_v: string) {},
      }
      const mockWin = {
        Window: function MockWindow() {} as unknown as { new (): object; prototype: object },
        Document: function MockDocument() {} as unknown as { new (): object },
        HTMLImageElement: mockImgCtor,
        Event: class MockEvent {
          constructor(_type: string) {}
        },
      } as unknown as Window
      const PolyfilledImage = createImagePolyfill(mockWin)
      const img = new (PolyfilledImage as unknown as new () => object)()
      return img instanceof (PolyfilledImage as unknown as new () => object)
    },
    expect: true,
    info: 'polyfilled image instanceof works',
  },
  {
    fn: () => {
      const mockImgCtor = function MockHTMLImageElement() {} as unknown as {
        new (): { prototype: { get src(): string; set src(v: string) }; src: string; width: number; height: number }
      }
      mockImgCtor.prototype = {
        get src() { return '' },
        set src(_v: string) {},
      }
      const mockWin = {
        Window: function MockWindow() {} as unknown as { new (): object; prototype: object },
        Document: function MockDocument() {} as unknown as { new (): object },
        HTMLImageElement: mockImgCtor,
        Event: class MockEvent {
          constructor(_type: string) {}
        },
      } as unknown as Window
      const PolyfilledImage = createImagePolyfill(mockWin)
      const img = new (PolyfilledImage as unknown as new () => object)()
      const imgRecord = img as unknown as Record<string, unknown>
      // Set data URL src
      imgRecord.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      return (imgRecord.width as number) > 0 && (imgRecord.height as number) > 0
    },
    expect: true,
    info: 'polyfilled image with data URL sets dimensions',
  },
  {
    fn: () => {
      const mockImgCtor = function MockHTMLImageElement() {} as unknown as {
        new (): { prototype: { get src(): string; set src(v: string) }; src: string }
      }
      mockImgCtor.prototype = {
        get src() { return '' },
        set src(_v: string) {},
      }
      const mockWin = {
        Window: function MockWindow() {} as unknown as { new (): object; prototype: object },
        Document: function MockDocument() {} as unknown as { new (): object },
        HTMLImageElement: mockImgCtor,
        Event: class MockEvent {
          constructor(_type: string) {}
        },
      } as unknown as Window
      const PolyfilledImage = createImagePolyfill(mockWin)
      const img = new (PolyfilledImage as unknown as new () => object)()
      // Non-data URL should fall through
      ;(img as unknown as Record<string, unknown>).src = 'https://example.com/image.png'
      return (img as unknown as Record<string, unknown>).src === 'https://example.com/image.png'
    },
    expect: true,
    info: 'polyfilled image with http URL preserves src',
  },
] satisfies TestCase[]
