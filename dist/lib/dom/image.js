import { loadImage } from 'canvas'
export const imageCache = new Map()
export const parsePngDimensions = dataUrl => {
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
export const createImagePolyfill = win => {
  const OriginalImage = win.Image
  const HTMLImageElement = win.HTMLImageElement
  const srcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
  const PolyfilledImage = function () {
    const img = new OriginalImage()
    Object.setPrototypeOf(img, PolyfilledImage.prototype)
    return img
  }
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
  PolyfilledImage.prototype.dispatchEvent = function () {
    return true
  }
  Object.defineProperty(PolyfilledImage.prototype, 'src', {
    get() {
      if (srcDesc?.get) return srcDesc.get.call(this)
      return ''
    },
    set(value) {
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
        const img = this
        loadImage(value)
          .then(nodeImg => {
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
