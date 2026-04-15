import is from '@magic/types'
import { Document as HappyDocument, Window as HappyWindow } from 'happy-dom'

import { createImagePolyfill } from './image.js'
import { createCanvasPolyfill } from './canvas.js'

let window: HappyWindow | null = null
let document: HappyDocument | null = null

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

export const initGlobals = (): { window: HappyWindow; document: HappyDocument } => {
  if (window && document) {
    return {
      window,
      document,
    }
  }
  window = new HappyWindow({ url: 'http://localhost/' })
  document = window!.document as unknown as HappyDocument

  define(globalThis as Record<string | symbol, unknown>, 'document', document)
  define(globalThis as Record<string | symbol, unknown>, 'window', window)
  define(globalThis as Record<string | symbol, unknown>, 'self', window)
  define(globalThis as Record<string | symbol, unknown>, 'navigator', window!.navigator)
  define(globalThis as Record<string | symbol, unknown>, 'location', window!.location)
  define(globalThis as Record<string | symbol, unknown>, 'history', window!.history)

  define(globalThis as Record<string | symbol, unknown>, 'Node', window!.Node)
  define(globalThis as Record<string | symbol, unknown>, 'Element', window!.Element)
  define(globalThis as Record<string | symbol, unknown>, 'HTMLElement', window!.HTMLElement)
  define(globalThis as Record<string | symbol, unknown>, 'SVGElement', window!.SVGElement)
  define(globalThis as Record<string | symbol, unknown>, 'Document', window!.Document)
  define(
    globalThis as Record<string | symbol, unknown>,
    'DocumentFragment',
    window!.DocumentFragment,
  )
  define(globalThis as Record<string | symbol, unknown>, 'Comment', window!.Comment)
  define(globalThis as Record<string | symbol, unknown>, 'Text', window!.Text)

  define(globalThis as Record<string | symbol, unknown>, 'Event', window!.Event)
  define(globalThis as Record<string | symbol, unknown>, 'CustomEvent', window!.CustomEvent)
  define(globalThis as Record<string | symbol, unknown>, 'MouseEvent', window!.MouseEvent)
  define(globalThis as Record<string | symbol, unknown>, 'KeyboardEvent', window!.KeyboardEvent)
  define(globalThis as Record<string | symbol, unknown>, 'InputEvent', window!.InputEvent)
  define(globalThis as Record<string | symbol, unknown>, 'TouchEvent', window!.TouchEvent)
  define(globalThis as Record<string | symbol, unknown>, 'PointerEvent', window!.PointerEvent)

  define(globalThis as Record<string | symbol, unknown>, 'FormData', window!.FormData)
  define(globalThis as Record<string | symbol, unknown>, 'File', window!.File)
  define(globalThis as Record<string | symbol, unknown>, 'FileList', window!.FileList)
  define(globalThis as Record<string | symbol, unknown>, 'Blob', window!.Blob)
  define(globalThis as Record<string | symbol, unknown>, 'URL', window!.URL)
  define(globalThis as Record<string | symbol, unknown>, 'URLSearchParams', window!.URLSearchParams)

  define(
    globalThis as Record<string | symbol, unknown>,
    'MutationObserver',
    window!.MutationObserver,
  )
  define(
    globalThis as Record<string | symbol, unknown>,
    'IntersectionObserver',
    window!.IntersectionObserver,
  )
  define(globalThis as Record<string | symbol, unknown>, 'ResizeObserver', window!.ResizeObserver)
  define(
    globalThis as Record<string | symbol, unknown>,
    'PerformanceObserver',
    window!.PerformanceObserver,
  )

  define(globalThis as Record<string | symbol, unknown>, 'FileReader', window!.FileReader)

  const PolyfilledImage = createImagePolyfill(window!)
  define(globalThis as Record<string | symbol, unknown>, 'Image', PolyfilledImage)
  define(
    globalThis as Record<string | symbol, unknown>,
    'HTMLImageElement',
    window!.HTMLImageElement,
  )

  createCanvasPolyfill(window)
  define(
    globalThis as Record<string | symbol, unknown>,
    'HTMLCanvasElement',
    window!.HTMLCanvasElement,
  )

  define(globalThis as Record<string | symbol, unknown>, 'TextEncoder', window!.TextEncoder)
  define(globalThis as Record<string | symbol, unknown>, 'TextDecoder', window!.TextDecoder)
  define(globalThis as Record<string | symbol, unknown>, 'atob', window!.atob)
  define(globalThis as Record<string | symbol, unknown>, 'btoa', window!.btoa)

  define(globalThis as Record<string | symbol, unknown>, 'Storage', window!.Storage)
  define(globalThis as Record<string | symbol, unknown>, 'sessionStorage', window!.sessionStorage)
  define(globalThis as Record<string | symbol, unknown>, 'localStorage', window!.localStorage)

  define(globalThis as Record<string | symbol, unknown>, 'Headers', window!.Headers)
  define(globalThis as Record<string | symbol, unknown>, 'Request', window!.Request)
  define(globalThis as Record<string | symbol, unknown>, 'Response', window!.Response)
  define(globalThis as Record<string | symbol, unknown>, 'AbortController', window!.AbortController)
  define(globalThis as Record<string | symbol, unknown>, 'AbortSignal', window!.AbortSignal)

  define(globalThis as Record<string | symbol, unknown>, 'ReadableStream', window!.ReadableStream)
  define(globalThis as Record<string | symbol, unknown>, 'WritableStream', window!.WritableStream)
  define(globalThis as Record<string | symbol, unknown>, 'TransformStream', window!.TransformStream)

  define(globalThis as Record<string | symbol, unknown>, 'XMLHttpRequest', window!.XMLHttpRequest)
  define(globalThis as Record<string | symbol, unknown>, 'DOMParser', window!.DOMParser)
  define(globalThis as Record<string | symbol, unknown>, 'XMLSerializer', window!.XMLSerializer)

  define(globalThis as Record<string | symbol, unknown>, 'WebSocket', window!.WebSocket)

  define(
    globalThis as Record<string | symbol, unknown>,
    'CustomElementRegistry',
    window!.CustomElementRegistry,
  )

  define(globalThis as Record<string | symbol, unknown>, 'MessagePort', window!.MessagePort)

  define(globalThis as Record<string | symbol, unknown>, 'MediaStream', window!.MediaStream)
  define(
    globalThis as Record<string | symbol, unknown>,
    'MediaStreamTrack',
    window!.MediaStreamTrack,
  )

  define(globalThis as Record<string | symbol, unknown>, 'Audio', window!.Audio)

  const winRecord = window!
  for (const [key, value] of Object.entries(winRecord)) {
    if (key.startsWith('HTML') && is.fn(value)) {
      define(globalThis, key, value)
    }
  }

  for (const [key, value] of Object.entries(winRecord)) {
    if (key.startsWith('SVG') && is.fn(value)) {
      define(globalThis as Record<string | symbol, unknown>, key, value)
    }
  }

  define(globalThis as Record<string | symbol, unknown>, 'globalThis', globalThis)

  define(globalThis as Record<string | symbol, unknown>, 'setTimeout', window!.setTimeout)
  define(globalThis as Record<string | symbol, unknown>, 'clearTimeout', window!.clearTimeout)
  define(globalThis as Record<string | symbol, unknown>, 'setInterval', window!.setInterval)
  define(globalThis as Record<string | symbol, unknown>, 'clearInterval', window!.clearInterval)

  define(
    globalThis as Record<string | symbol, unknown>,
    'requestAnimationFrame',
    window!.requestAnimationFrame,
  )
  define(
    globalThis as Record<string | symbol, unknown>,
    'cancelAnimationFrame',
    window!.cancelAnimationFrame,
  )

  define(globalThis as Record<string | symbol, unknown>, 'fetch', window!.fetch)
  define(globalThis as Record<string | symbol, unknown>, 'queueMicrotask', window!.queueMicrotask)

  return {
    window,
    document,
  }
}
