/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas, Image, createCanvas, loadImage } from 'canvas'
import is from '@magic/types'
let origGetContext = null
export const createCanvasPolyfill = () => {
  const HTMLCanvasElement = globalThis.HTMLCanvasElement
  if (origGetContext) {
    return
  }
  origGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (type !== '2d') {
      return origGetContext.call(this, type, ...args)
    }
    if (!this._nodeCanvas) {
      this._nodeCanvas = createCanvas(this.width || 300, this.height || 150)
    }
    const ctx = this._nodeCanvas.getContext('2d')
    const originalDrawImage = ctx.drawImage.bind(ctx)
    const originalToDataURL = ctx.toDataURL?.bind(ctx)
    const drawImageFn = (img, ...drawArgs) => {
      if (is.instance(img, Image) || ('_nodeCanvasImage' in img && img._nodeCanvasImage)) {
        const nodeImg = is.instance(img, Image) ? img : img._nodeCanvasImage
        return originalDrawImage(nodeImg, ...drawArgs)
      }
      if (is.instance(img, Canvas)) {
        return originalDrawImage(img, ...drawArgs)
      }
      const imgSrc = img.src
      if (is.string(imgSrc) && imgSrc.startsWith('data:image')) {
        loadImage(imgSrc)
          .then(loadedImg => {
            originalDrawImage(loadedImg, ...drawArgs)
          })
          .catch(() => {})
        return
      }
      return originalDrawImage(img, ...drawArgs)
    }
    const toDataURLFn = (mimeType = 'image/png', quality) =>
      originalToDataURL?.(mimeType, quality) || ''
    ctx.drawImage = drawImageFn
    ctx.toDataURL = toDataURLFn
    return ctx
  }
}
