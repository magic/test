import is from '@magic/types'
import { Document as HappyDocument, Window as HappyWindow } from 'happy-dom'

import type { CustomWindow } from './types.ts'
import { createImagePolyfill } from './image.ts'
import { createCanvasPolyfill } from './canvas.ts'

export let happyWindow: CustomWindow | null = null
export let happyDocument: HappyDocument | null = null

export const define = (
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

export const initGlobals = (): void => {
  if (happyWindow) return

  happyWindow = new HappyWindow({ url: 'http://localhost/' }) as unknown as CustomWindow
  happyDocument = happyWindow!.document as unknown as HappyDocument

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
