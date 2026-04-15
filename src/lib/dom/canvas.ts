import { createCanvas, loadImage } from 'canvas'

import type { CanvasRenderingContext2D } from './types.js'
import type { Window } from 'happy-dom'

export const createCanvasPolyfill = (win: Window): void => {
  const HTMLCanvasElement = win.HTMLCanvasElement as {
    prototype: {
      getContext: (type: string, ...args: unknown[]) => unknown
      width: number
      height: number
      toDataURL: (mimeType?: string, quality?: number) => string
    }
  }
  const originalGetContext = HTMLCanvasElement.prototype.getContext

  HTMLCanvasElement.prototype.getContext = function (
    this: { width: number; height: number },
    type: string,
    ...args: unknown[]
  ): CanvasRenderingContext2D | null {
    if (type === '2d') {
      const canvas = createCanvas(this.width || 300, this.height || 150)
      const ctx = canvas.getContext('2d')!

      const originalDrawImage = ctx.drawImage
      const drawImageWithUnknownArgs = originalDrawImage as (
        this: CanvasRenderingContext2D,
        img: unknown,
        ...args: unknown[]
      ) => void

      ctx.drawImage = function (
        this: CanvasRenderingContext2D,
        img: unknown,
        ...drawArgs: unknown[]
      ): void {
        if (
          img &&
          typeof (img as { _nodeCanvasImage?: unknown })._nodeCanvasImage !== 'undefined'
        ) {
          return drawImageWithUnknownArgs.call(
            this,
            (img as { _nodeCanvasImage: unknown })._nodeCanvasImage,
            ...drawArgs,
          )
        }

        if (
          img &&
          typeof (img as { width?: number }).width === 'number' &&
          typeof (img as { height?: number }).height === 'number' &&
          (img as { width: number }).width > 0 &&
          (img as { height: number }).height > 0 &&
          typeof (img as { src?: string }).src === 'string' &&
          (img as { src: string }).src.startsWith('data:image')
        ) {
          try {
            const nodeImg = loadImage((img as { src: string }).src)
            return drawImageWithUnknownArgs.call(this, nodeImg, ...drawArgs)
          } catch {
            // Fall through to original
          }
        }

        return drawImageWithUnknownArgs.call(this, img, ...drawArgs)
      }

      const ctxWithToDataURL = ctx as unknown as CanvasRenderingContext2D & {
        toDataURL: (mimeType?: string, quality?: number) => string
      }
      return ctxWithToDataURL
    }

    if (type === 'webgl' || type === 'webgl2') {
      return (originalGetContext as (type: string, ...args: unknown[]) => unknown).call(
        this,
        type,
        ...args,
      ) as CanvasRenderingContext2D | null
    }

    return (originalGetContext as (type: string, ...args: unknown[]) => unknown).call(
      this,
      type,
      ...args,
    ) as CanvasRenderingContext2D | null
  }

  HTMLCanvasElement.prototype.toDataURL = function (
    this: { width: number; height: number },
    mimeType = 'image/png',
    quality?: number,
  ): string {
    const canvas = createCanvas(this.width || 300, this.height || 150)
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D & {
      toDataURL: (mimeType?: string, quality?: number) => string
    }
    return ctx.toDataURL(mimeType, quality)
  }
}
