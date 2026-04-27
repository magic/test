import {
  Canvas,
  // Image,
  createCanvas,
  // loadImage,
} from 'canvas'

// import is from '@magic/types'

export const createCanvasPolyfill = (): Canvas => {
  return createCanvas(300, 150)
  // const originalGetContext = HTMLCanvasElement.prototype.getContext

  // HTMLCanvasElement.prototype.getContext = function (
  //   this: { width: number; height: number },
  //   type: string,
  //   ...args: unknown[]
  // ): RenderingContext | null {
  //   if (type === '2d') {
  //     const canvas = createCanvas(this.width || 300, this.height || 150)
  //     const ctx = canvas.getContext('2d')!

  //     const originalDrawImage = ctx.drawImage
  //     const drawImageWithUnknownArgs = originalDrawImage as (
  //       this: RenderingContext,
  //       img: unknown,
  //       ...args: unknown[]
  //     ) => void

  //     ctx.drawImage = function (
  //       this: RenderingContext,
  //       img: Canvas | Image,
  //       ...drawArgs: unknown[]
  //     ): void {
  //       if (
  //         img &&
  //         is.number(img.width) &&
  //         is.number(img.height) &&
  //         (img as { width: number }).width > 0 &&
  //         (img as { height: number }).height > 0 &&
  //         is.instance(img, Image) &&
  //         is.string(img.src) &&
  //         img.src.startsWith('data:image')
  //       ) {
  //         try {
  //           const nodeImg = loadImage((img as { src: string }).src)
  //           return drawImageWithUnknownArgs.call(this, nodeImg, ...drawArgs)
  //         } catch {
  //           // Fall through to original
  //         }
  //       }

  //       return drawImageWithUnknownArgs.call(this, img, ...drawArgs)
  //     }

  //     const ctxWithToDataURL = ctx
  //     return ctxWithToDataURL
  //   }

  //   if (type === 'webgl' || type === 'webgl2') {
  //     return originalGetContext.call(
  //       this,
  //       type,
  //       ...args,
  //     )
  //   }

  //   return originalGetContext.call(
  //     this,
  //     type,
  //     ...args,
  //   )
  // }

  // HTMLCanvasElement.prototype.toDataURL = function (
  //   this: { width: number; height: number },
  //   mimeType = 'image/png',
  //   quality?: number,
  // ): string {
  //   const canvas = createCanvas(this.width || 300, this.height || 150)
  //   const ctx = canvas.getContext('2d')
  //   return ctx.toDataURL(mimeType, quality)
  // }
}
