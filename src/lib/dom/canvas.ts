/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas, Image, createCanvas, loadImage } from '@napi-rs/canvas/node-canvas.js'
import is from '@magic/types'

let origGetContext: ((type: string, ...args: unknown[]) => unknown) | null = null

export const createCanvasPolyfill = (): void => {
  const HTMLCanvasElement = globalThis.HTMLCanvasElement as unknown as {
    prototype: {
      getContext: (type: string, ...args: unknown[]) => unknown
      width: number
      height: number
    }
  }

  if (origGetContext) {
    return
  }

  origGetContext = HTMLCanvasElement.prototype.getContext as any

  HTMLCanvasElement.prototype.getContext = function (
    this: { width: number; height: number; _nodeCanvas?: Canvas },
    type: string,
    ...args: unknown[]
  ): unknown {
    if (type !== '2d') {
      return origGetContext!.call(this, type, ...args)
    }

    if (!this._nodeCanvas) {
      this._nodeCanvas = createCanvas(this.width || 300, this.height || 150)
    }

    const ctx: any = this._nodeCanvas.getContext('2d')

    const originalDrawImage = ctx.drawImage.bind(ctx)
    // napi-rs keeps encoding on the canvas object, not the 2d context
    const originalToDataURL = (this._nodeCanvas as any).toDataURL?.bind(this._nodeCanvas)

    const drawImageFn = (
      img:
        | Canvas
        | Image
        | { _nodeCanvasImage?: unknown; width: number; height: number; src?: string },
      ...drawArgs: unknown[]
    ): void => {
      if (is.instance(img, Image) || ('_nodeCanvasImage' in img && img._nodeCanvasImage)) {
        const nodeImg = is.instance(img, Image) ? img : img._nodeCanvasImage
        return originalDrawImage(nodeImg, ...drawArgs)
      }

      if (is.instance(img, Canvas)) {
        return originalDrawImage(img, ...drawArgs)
      }

      const imgSrc = (img as { src?: string }).src
      if (is.string(imgSrc) && imgSrc.startsWith('data:image')) {
        loadImage(imgSrc)
          .then((loadedImg: unknown) => {
            originalDrawImage(loadedImg, ...drawArgs)
          })
          .catch(() => {})
        return
      }

      return originalDrawImage(
        img as Canvas | Image,
        ...(drawArgs as [Canvas | Image, ...unknown[]]),
      )
    }

    const toDataURLFn = (mimeType = 'image/png', quality?: number): string =>
      originalToDataURL?.(mimeType, quality) || ''

    ctx.drawImage = drawImageFn
    ctx.toDataURL = toDataURLFn

    return ctx
  }
}
