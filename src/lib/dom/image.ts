import type { Window } from 'happy-dom'

import { loadImage } from 'canvas'

import type { ImageInstance, ImageConstructor } from './types.js'

export const imageCache = new Map<string, unknown>()

export const parsePngDimensions = (dataUrl: string): { width: number; height: number } => {
  try {
    const base64 = dataUrl.split(',')[1]
    if (!base64) return { width: 1, height: 1 }

    const binary = atob(base64.slice(0, 100))
    if (binary.length < 24) return { width: 1, height: 1 }

    const width =
      (binary.charCodeAt(16) << 24) |
      (binary.charCodeAt(17) << 16) |
      (binary.charCodeAt(18) << 8) |
      binary.charCodeAt(19)
    const height =
      (binary.charCodeAt(20) << 24) |
      (binary.charCodeAt(21) << 16) |
      (binary.charCodeAt(22) << 8) |
      binary.charCodeAt(23)

    return { width: width || 1, height: height || 1 }
  } catch {
    return { width: 1, height: 1 }
  }
}

export const createImagePolyfill = (win: Window): new () => ImageInstance => {
  const OriginalImage = win.Image as unknown as ImageConstructor
  const HTMLImageElement = win.HTMLImageElement as unknown as { prototype: ImageInstance }
  const srcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')

  const PolyfilledImage = function (this: ImageInstance): ImageInstance {
    const img = new (OriginalImage as new () => ImageInstance)()
    Object.setPrototypeOf(img, PolyfilledImage.prototype)
    return img
  } as unknown as new () => ImageInstance

  PolyfilledImage.prototype = OriginalImage.prototype
  PolyfilledImage.prototype.constructor = PolyfilledImage

  Object.defineProperty(PolyfilledImage.prototype, '_nodeCanvasImage', {
    value: null,
    writable: true,
    configurable: true,
    enumerable: false,
  })
  Object.defineProperty(PolyfilledImage.prototype, 'onload', {
    value: null,
    writable: true,
    configurable: true,
    enumerable: false,
  })
  PolyfilledImage.prototype.addEventListener = function () {}
  PolyfilledImage.prototype.dispatchEvent = function (): boolean {
    return true
  }

  Object.defineProperty(PolyfilledImage.prototype, 'src', {
    get(): string {
      if (srcDesc?.get) return srcDesc.get.call(this) as string
      return ''
    },
    set(value: string): void {
      if (value && value.startsWith('data:image')) {
        const { width, height } = parsePngDimensions(value)

        if (srcDesc?.set) srcDesc.set.call(this, value)

        Object.defineProperty(this, 'width', {
          value: width,
          writable: true,
          configurable: true,
          enumerable: true,
        })
        Object.defineProperty(this, 'height', {
          value: height,
          writable: true,
          configurable: true,
          enumerable: true,
        })
        Object.defineProperty(this, 'complete', {
          value: true,
          writable: true,
          configurable: true,
          enumerable: true,
        })

        const img = this as ImageInstance & { _nodeCanvasImage?: unknown }
        loadImage(value)
          .then((nodeImg: unknown) => {
            img._nodeCanvasImage = nodeImg

            if (img.onload) {
              const event = new win.Event('load')
              img.onload.call(img, event)
            }
            if (img.addEventListener) {
              img.dispatchEvent(new win.Event('load'))
            }
          })
          .catch(() => {
            if (img.onload) {
              const event = new win.Event('load')
              img.onload.call(img, event)
            }
            if (img.addEventListener) {
              img.dispatchEvent(new win.Event('load'))
            }
          })
      } else {
        if (srcDesc?.set) srcDesc.set.call(this, value)
      }
    },
    configurable: true,
  })

  return PolyfilledImage
}
