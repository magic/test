import is from '@magic/types'
import { createCanvas, loadImage } from 'canvas'
export const createCanvasPolyfill = win => {
  const HTMLCanvasElement = win.HTMLCanvasElement
  const originalGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (type === '2d') {
      const canvas = createCanvas(this.width || 300, this.height || 150)
      const ctx = canvas.getContext('2d')
      const originalDrawImage = ctx.drawImage
      const drawImageWithUnknownArgs = originalDrawImage
      ctx.drawImage = function (img, ...drawArgs) {
        if (img && !is.undefined(img._nodeCanvasImage)) {
          return drawImageWithUnknownArgs.call(this, img._nodeCanvasImage, ...drawArgs)
        }
        if (
          img &&
          is.number(img.width) &&
          is.number(img.height) &&
          img.width > 0 &&
          img.height > 0 &&
          is.string(img.src) &&
          img.src.startsWith('data:image')
        ) {
          try {
            const nodeImg = loadImage(img.src)
            return drawImageWithUnknownArgs.call(this, nodeImg, ...drawArgs)
          } catch {
            // Fall through to original
          }
        }
        return drawImageWithUnknownArgs.call(this, img, ...drawArgs)
      }
      const ctxWithToDataURL = ctx
      return ctxWithToDataURL
    }
    if (type === 'webgl' || type === 'webgl2') {
      return originalGetContext.call(this, type, ...args)
    }
    return originalGetContext.call(this, type, ...args)
  }
  HTMLCanvasElement.prototype.toDataURL = function (mimeType = 'image/png', quality) {
    const canvas = createCanvas(this.width || 300, this.height || 150)
    const ctx = canvas.getContext('2d')
    return ctx.toDataURL(mimeType, quality)
  }
}
