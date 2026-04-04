import { createRequire } from 'node:module'
import is from '@magic/types'
import { Document as HappyDocument, Window as HappyWindow } from 'happy-dom'

interface SimpleEvent {
  type: string
  target?: unknown
  currentTarget?: unknown
}

interface ImageInstance {
  _nodeCanvasImage?: unknown
  onload?: (event: SimpleEvent) => void
  addEventListener?: (type: string, listener: (event: SimpleEvent) => void) => void
  dispatchEvent: (event: SimpleEvent) => boolean
  width: number
  height: number
  complete: boolean
  src: string
}

interface ImageConstructor {
  new (): ImageInstance
  prototype: ImageInstance
}

interface CanvasRenderingContext2D {
  drawImage: (img: unknown, ...args: unknown[]) => void
  toDataURL: (mimeType?: string, quality?: number) => string
}

interface CustomWindow {
  document: HappyDocument
  [key: string]: unknown
  Image: ImageConstructor
  HTMLImageElement: { prototype: ImageInstance }
  HTMLCanvasElement: {
    prototype: { getContext: unknown; width: number; height: number; toDataURL: unknown }
  }
  Event: new (type: string, eventInitDict?: unknown) => SimpleEvent
  navigator: unknown
  location: unknown
  history: unknown
  Node: unknown
  Element: unknown
  HTMLElement: unknown
  SVGElement: unknown
  Document: unknown
  DocumentFragment: unknown
  Comment: unknown
  Text: unknown
  CustomEvent: unknown
  MouseEvent: unknown
  KeyboardEvent: unknown
  InputEvent: unknown
  TouchEvent: unknown
  PointerEvent: unknown
  FormData: unknown
  File: unknown
  FileList: unknown
  Blob: unknown
  URL: unknown
  URLSearchParams: unknown
  MutationObserver: unknown
  IntersectionObserver: unknown
  ResizeObserver: unknown
  PerformanceObserver: unknown
  FileReader: unknown
  AbortController: unknown
  AbortSignal: unknown
  ReadableStream: unknown
  WritableStream: unknown
  TransformStream: unknown
  XMLHttpRequest: unknown
  DOMParser: unknown
  XMLSerializer: unknown
  WebSocket: unknown
  CustomElementRegistry: unknown
  MessagePort: unknown
  MediaStream: unknown
  MediaStreamTrack: unknown
  Audio: unknown
  TextEncoder: unknown
  TextDecoder: unknown
  atob: (encoded: string) => string
  btoa: (decoded: string) => string
  Storage: unknown
  sessionStorage: unknown
  localStorage: unknown
  Headers: unknown
  Request: unknown
  Response: unknown
  setTimeout: unknown
  clearTimeout: unknown
  setInterval: unknown
  clearInterval: unknown
  requestAnimationFrame: unknown
  cancelAnimationFrame: unknown
  fetch: unknown
  queueMicrotask: unknown
  globalThis: unknown
}

let happyWindow: CustomWindow | null = null
let happyDocument: HappyDocument | null = null

const define = (
  target: Record<string | symbol, unknown>,
  key: string | symbol,
  value: unknown,
): void => {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  })
}

const parsePngDimensions = (dataUrl: string): { width: number; height: number } => {
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

const imageCache = new Map<string, unknown>()

const createImagePolyfill = (win: CustomWindow): new () => ImageInstance => {
  const OriginalImage = win.Image as ImageConstructor
  const HTMLImageElement = win.HTMLImageElement as { prototype: ImageInstance }
  const srcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
  const createRequireFn = createRequire(import.meta.url)

  const PolyfilledImage = function (this: ImageInstance): ImageInstance {
    // Constructing original image
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

        const { loadImage: nodeLoadImage } = createRequireFn('canvas') as {
          loadImage: (url: string) => Promise<unknown>
        }
        const img = this as ImageInstance & { _nodeCanvasImage?: unknown }
        nodeLoadImage(value)
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

const createCanvasPolyfill = (win: CustomWindow, _happyDocument: unknown): void => {
  const HTMLCanvasElement = win.HTMLCanvasElement as {
    prototype: {
      getContext: (type: string, ...args: unknown[]) => unknown
      width: number
      height: number
      toDataURL: (mimeType?: string, quality?: number) => string
    }
  }
  const originalGetContext = HTMLCanvasElement.prototype.getContext
  const createRequireFn = createRequire(import.meta.url)
  const { createCanvas: nodeCreateCanvas, loadImage: nodeLoadImage } = createRequireFn(
    'canvas',
  ) as {
    createCanvas: (
      width: number,
      height: number,
    ) => {
      getContext: (type: string) => CanvasRenderingContext2D
      width: number
      height: number
      toDataURL: (mimeType?: string, quality?: number) => string
    }
    loadImage: (src: string) => Promise<unknown>
  }

  HTMLCanvasElement.prototype.getContext = function (
    this: { width: number; height: number },
    type: string,
    ...args: unknown[]
  ): CanvasRenderingContext2D | null {
    if (type === '2d') {
      const canvas = nodeCreateCanvas(this.width || 300, this.height || 150)
      const ctx = canvas.getContext('2d')!

      const originalDrawImage = ctx.drawImage
      ctx.drawImage = function (
        this: CanvasRenderingContext2D,
        img: unknown,
        ...drawArgs: unknown[]
      ): void {
        // Try to use pre-loaded canvas image
        if (
          img &&
          typeof (img as { _nodeCanvasImage?: unknown })._nodeCanvasImage !== 'undefined'
        ) {
          return originalDrawImage.call(
            this,
            (img as { _nodeCanvasImage: unknown })._nodeCanvasImage,
            ...drawArgs,
          )
        }

        // Check if img has width/height/src and is a data URL
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
            const nodeImg = nodeLoadImage((img as { src: string }).src)
            return originalDrawImage.call(this, nodeImg, ...drawArgs)
          } catch {
            // Fall through to original
          }
        }

        return originalDrawImage.call(this, img, ...drawArgs)
      }

      return ctx
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
    const canvas = nodeCreateCanvas(this.width || 300, this.height || 150)
    const ctx = canvas.getContext('2d')!
    return ctx.toDataURL(mimeType, quality)
  }
}

const initGlobals = (): void => {
  if (happyWindow) return

  happyWindow = new (HappyWindow as any)({ url: 'http://localhost/' }) as CustomWindow
  happyDocument = happyWindow!.document

  define(globalThis as Record<string | symbol, unknown>, 'document', happyDocument)
  define(globalThis as Record<string | symbol, unknown>, 'window', happyWindow)
  define(globalThis as Record<string | symbol, unknown>, 'self', happyWindow)
  define(globalThis as Record<string | symbol, unknown>, 'navigator', happyWindow!.navigator)
  define(globalThis as Record<string | symbol, unknown>, 'location', happyWindow!.location)
  define(globalThis as Record<string | symbol, unknown>, 'history', happyWindow!.history)

  define(globalThis as Record<string | symbol, unknown>, 'Node', happyWindow!.Node)
  define(globalThis as Record<string | symbol, unknown>, 'Element', happyWindow!.Element)
  define(globalThis as Record<string | symbol, unknown>, 'HTMLElement', happyWindow!.HTMLElement)
  define(globalThis as Record<string | symbol, unknown>, 'SVGElement', happyWindow!.SVGElement)
  define(globalThis as Record<string | symbol, unknown>, 'Document', happyWindow!.Document)
  define(
    globalThis as Record<string | symbol, unknown>,
    'DocumentFragment',
    happyWindow!.DocumentFragment,
  )
  define(globalThis as Record<string | symbol, unknown>, 'Comment', happyWindow!.Comment)
  define(globalThis as Record<string | symbol, unknown>, 'Text', happyWindow!.Text)

  define(globalThis as Record<string | symbol, unknown>, 'Event', happyWindow!.Event)
  define(globalThis as Record<string | symbol, unknown>, 'CustomEvent', happyWindow!.CustomEvent)
  define(globalThis as Record<string | symbol, unknown>, 'MouseEvent', happyWindow!.MouseEvent)
  define(
    globalThis as Record<string | symbol, unknown>,
    'KeyboardEvent',
    happyWindow!.KeyboardEvent,
  )
  define(globalThis as Record<string | symbol, unknown>, 'InputEvent', happyWindow!.InputEvent)
  define(globalThis as Record<string | symbol, unknown>, 'TouchEvent', happyWindow!.TouchEvent)
  define(globalThis as Record<string | symbol, unknown>, 'PointerEvent', happyWindow!.PointerEvent)

  define(globalThis as Record<string | symbol, unknown>, 'FormData', happyWindow!.FormData)
  define(globalThis as Record<string | symbol, unknown>, 'File', happyWindow!.File)
  define(globalThis as Record<string | symbol, unknown>, 'FileList', happyWindow!.FileList)
  define(globalThis as Record<string | symbol, unknown>, 'Blob', happyWindow!.Blob)
  define(globalThis as Record<string | symbol, unknown>, 'URL', happyWindow!.URL)
  define(
    globalThis as Record<string | symbol, unknown>,
    'URLSearchParams',
    happyWindow!.URLSearchParams,
  )

  define(
    globalThis as Record<string | symbol, unknown>,
    'MutationObserver',
    happyWindow!.MutationObserver,
  )
  define(
    globalThis as Record<string | symbol, unknown>,
    'IntersectionObserver',
    happyWindow!.IntersectionObserver,
  )
  define(
    globalThis as Record<string | symbol, unknown>,
    'ResizeObserver',
    happyWindow!.ResizeObserver,
  )
  define(
    globalThis as Record<string | symbol, unknown>,
    'PerformanceObserver',
    happyWindow!.PerformanceObserver,
  )

  define(globalThis as Record<string | symbol, unknown>, 'FileReader', happyWindow!.FileReader)

  const PolyfilledImage = createImagePolyfill(happyWindow!)
  define(globalThis as Record<string | symbol, unknown>, 'Image', PolyfilledImage)
  define(
    globalThis as Record<string | symbol, unknown>,
    'HTMLImageElement',
    happyWindow!.HTMLImageElement,
  )

  createCanvasPolyfill(happyWindow!, happyDocument)
  define(
    globalThis as Record<string | symbol, unknown>,
    'HTMLCanvasElement',
    happyWindow!.HTMLCanvasElement,
  )

  define(globalThis as Record<string | symbol, unknown>, 'TextEncoder', happyWindow!.TextEncoder)
  define(globalThis as Record<string | symbol, unknown>, 'TextDecoder', happyWindow!.TextDecoder)
  define(globalThis as Record<string | symbol, unknown>, 'atob', happyWindow!.atob)
  define(globalThis as Record<string | symbol, unknown>, 'btoa', happyWindow!.btoa)

  define(globalThis as Record<string | symbol, unknown>, 'Storage', happyWindow!.Storage)
  define(
    globalThis as Record<string | symbol, unknown>,
    'sessionStorage',
    happyWindow!.sessionStorage,
  )
  define(globalThis as Record<string | symbol, unknown>, 'localStorage', happyWindow!.localStorage)

  define(globalThis as Record<string | symbol, unknown>, 'Headers', happyWindow!.Headers)
  define(globalThis as Record<string | symbol, unknown>, 'Request', happyWindow!.Request)
  define(globalThis as Record<string | symbol, unknown>, 'Response', happyWindow!.Response)
  define(
    globalThis as Record<string | symbol, unknown>,
    'AbortController',
    happyWindow!.AbortController,
  )
  define(globalThis as Record<string | symbol, unknown>, 'AbortSignal', happyWindow!.AbortSignal)

  define(
    globalThis as Record<string | symbol, unknown>,
    'ReadableStream',
    happyWindow!.ReadableStream,
  )
  define(
    globalThis as Record<string | symbol, unknown>,
    'WritableStream',
    happyWindow!.WritableStream,
  )
  define(
    globalThis as Record<string | symbol, unknown>,
    'TransformStream',
    happyWindow!.TransformStream,
  )

  define(
    globalThis as Record<string | symbol, unknown>,
    'XMLHttpRequest',
    happyWindow!.XMLHttpRequest,
  )
  define(globalThis as Record<string | symbol, unknown>, 'DOMParser', happyWindow!.DOMParser)
  define(
    globalThis as Record<string | symbol, unknown>,
    'XMLSerializer',
    happyWindow!.XMLSerializer,
  )

  define(globalThis as Record<string | symbol, unknown>, 'WebSocket', happyWindow!.WebSocket)

  define(
    globalThis as Record<string | symbol, unknown>,
    'CustomElementRegistry',
    happyWindow!.CustomElementRegistry,
  )

  define(globalThis as Record<string | symbol, unknown>, 'MessagePort', happyWindow!.MessagePort)

  define(globalThis as Record<string | symbol, unknown>, 'MediaStream', happyWindow!.MediaStream)
  define(
    globalThis as Record<string | symbol, unknown>,
    'MediaStreamTrack',
    happyWindow!.MediaStreamTrack,
  )

  define(globalThis as Record<string | symbol, unknown>, 'Audio', happyWindow!.Audio)

  const winRecord = happyWindow! as Record<string, unknown>
  for (const [key, value] of Object.entries(winRecord)) {
    if (key.startsWith('HTML') && is.fn(value)) {
      define(globalThis as Record<string | symbol, unknown>, key, value)
    }
  }

  for (const [key, value] of Object.entries(winRecord)) {
    if (key.startsWith('SVG') && is.fn(value)) {
      define(globalThis as Record<string | symbol, unknown>, key, value)
    }
  }

  define(globalThis as Record<string | symbol, unknown>, 'globalThis', globalThis)

  define(globalThis as Record<string | symbol, unknown>, 'setTimeout', happyWindow!.setTimeout)
  define(globalThis as Record<string | symbol, unknown>, 'clearTimeout', happyWindow!.clearTimeout)
  define(globalThis as Record<string | symbol, unknown>, 'setInterval', happyWindow!.setInterval)
  define(
    globalThis as Record<string | symbol, unknown>,
    'clearInterval',
    happyWindow!.clearInterval,
  )

  define(
    globalThis as Record<string | symbol, unknown>,
    'requestAnimationFrame',
    happyWindow!.requestAnimationFrame,
  )
  define(
    globalThis as Record<string | symbol, unknown>,
    'cancelAnimationFrame',
    happyWindow!.cancelAnimationFrame,
  )

  define(globalThis as Record<string | symbol, unknown>, 'fetch', happyWindow!.fetch)
  define(
    globalThis as Record<string | symbol, unknown>,
    'queueMicrotask',
    happyWindow!.queueMicrotask,
  )
}

export const initDOM = (): void => {
  initGlobals()
}

export const getDocument = (): unknown => {
  initGlobals()
  return happyDocument
}

export const getWindow = (): CustomWindow => {
  initGlobals()
  return happyWindow!
}

export const isInitialized = (): boolean => happyWindow !== null
