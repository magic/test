import is from '@magic/types'
import { Window as HappyWindow } from 'happy-dom'
import { createImagePolyfill } from './image.js'
import { createCanvasPolyfill } from './canvas.js'
let window = null
let document = null
export const define = (target, key, value) => {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  })
}
export const initGlobals = () => {
  if (window && document) {
    return {
      window,
      document,
    }
  }
  window = new HappyWindow({ url: 'http://localhost/' })
  document = window.document
  define(globalThis, 'document', document)
  define(globalThis, 'window', window)
  define(globalThis, 'self', window)
  define(globalThis, 'navigator', window.navigator)
  define(globalThis, 'location', window.location)
  define(globalThis, 'history', window.history)
  define(globalThis, 'Node', window.Node)
  define(globalThis, 'Element', window.Element)
  define(globalThis, 'HTMLElement', window.HTMLElement)
  define(globalThis, 'SVGElement', window.SVGElement)
  define(globalThis, 'Document', window.Document)
  define(globalThis, 'DocumentFragment', window.DocumentFragment)
  define(globalThis, 'Comment', window.Comment)
  define(globalThis, 'Text', window.Text)
  define(globalThis, 'Event', window.Event)
  define(globalThis, 'CustomEvent', window.CustomEvent)
  define(globalThis, 'MouseEvent', window.MouseEvent)
  define(globalThis, 'KeyboardEvent', window.KeyboardEvent)
  define(globalThis, 'InputEvent', window.InputEvent)
  define(globalThis, 'TouchEvent', window.TouchEvent)
  define(globalThis, 'PointerEvent', window.PointerEvent)
  define(globalThis, 'FormData', window.FormData)
  define(globalThis, 'File', window.File)
  define(globalThis, 'FileList', window.FileList)
  define(globalThis, 'Blob', window.Blob)
  define(globalThis, 'URL', window.URL)
  define(globalThis, 'URLSearchParams', window.URLSearchParams)
  define(globalThis, 'MutationObserver', window.MutationObserver)
  define(globalThis, 'IntersectionObserver', window.IntersectionObserver)
  define(globalThis, 'ResizeObserver', window.ResizeObserver)
  define(globalThis, 'PerformanceObserver', window.PerformanceObserver)
  define(globalThis, 'FileReader', window.FileReader)
  const PolyfilledImage = createImagePolyfill(window)
  define(globalThis, 'Image', PolyfilledImage)
  define(globalThis, 'HTMLImageElement', window.HTMLImageElement)
  createCanvasPolyfill(window)
  define(globalThis, 'HTMLCanvasElement', window.HTMLCanvasElement)
  define(globalThis, 'TextEncoder', window.TextEncoder)
  define(globalThis, 'TextDecoder', window.TextDecoder)
  define(globalThis, 'atob', window.atob)
  define(globalThis, 'btoa', window.btoa)
  define(globalThis, 'Storage', window.Storage)
  define(globalThis, 'sessionStorage', window.sessionStorage)
  define(globalThis, 'localStorage', window.localStorage)
  define(globalThis, 'Headers', window.Headers)
  define(globalThis, 'Request', window.Request)
  define(globalThis, 'Response', window.Response)
  define(globalThis, 'AbortController', window.AbortController)
  define(globalThis, 'AbortSignal', window.AbortSignal)
  define(globalThis, 'ReadableStream', window.ReadableStream)
  define(globalThis, 'WritableStream', window.WritableStream)
  define(globalThis, 'TransformStream', window.TransformStream)
  define(globalThis, 'XMLHttpRequest', window.XMLHttpRequest)
  define(globalThis, 'DOMParser', window.DOMParser)
  define(globalThis, 'XMLSerializer', window.XMLSerializer)
  define(globalThis, 'WebSocket', window.WebSocket)
  define(globalThis, 'CustomElementRegistry', window.CustomElementRegistry)
  define(globalThis, 'MessagePort', window.MessagePort)
  define(globalThis, 'MediaStream', window.MediaStream)
  define(globalThis, 'MediaStreamTrack', window.MediaStreamTrack)
  define(globalThis, 'Audio', window.Audio)
  const winRecord = window
  for (const [key, value] of Object.entries(winRecord)) {
    if (key.startsWith('HTML') && is.fn(value)) {
      define(globalThis, key, value)
    }
  }
  for (const [key, value] of Object.entries(winRecord)) {
    if (key.startsWith('SVG') && is.fn(value)) {
      define(globalThis, key, value)
    }
  }
  define(globalThis, 'globalThis', globalThis)
  define(globalThis, 'setTimeout', window.setTimeout)
  define(globalThis, 'clearTimeout', window.clearTimeout)
  define(globalThis, 'setInterval', window.setInterval)
  define(globalThis, 'clearInterval', window.clearInterval)
  define(globalThis, 'requestAnimationFrame', window.requestAnimationFrame)
  define(globalThis, 'cancelAnimationFrame', window.cancelAnimationFrame)
  define(globalThis, 'fetch', window.fetch)
  define(globalThis, 'queueMicrotask', window.queueMicrotask)
  return {
    window,
    document,
  }
}
