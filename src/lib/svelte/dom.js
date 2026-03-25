import is from '@magic/types'
import { Window } from 'happy-dom'

/** @type {import('happy-dom').Window} */
let happyWindow
/** @type {import('happy-dom').Document} */
let happyDocument

/**
 * @param {object} target
 * @param {string|symbol} key
 * @param {unknown} value
 */
const define = (target, key, value) => {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  })
}

const setupGlobals = () => {
  if (!happyWindow) {
    happyWindow = new Window()
    happyDocument = happyWindow.document
  }

  define(globalThis, 'document', happyDocument)
  define(globalThis, 'window', happyWindow)
  define(globalThis, 'self', happyWindow)
  define(globalThis, 'navigator', happyWindow.navigator)
  define(globalThis, 'location', happyWindow.location)
  define(globalThis, 'history', happyWindow.history)

  define(globalThis, 'Node', happyWindow.Node)
  define(globalThis, 'Element', happyWindow.Element)
  define(globalThis, 'HTMLElement', happyWindow.HTMLElement)
  define(globalThis, 'SVGElement', happyWindow.SVGElement)
  define(globalThis, 'Document', happyWindow.Document)
  define(globalThis, 'DocumentFragment', happyWindow.DocumentFragment)
  define(globalThis, 'Comment', happyWindow.Comment)
  define(globalThis, 'Text', happyWindow.Text)

  define(globalThis, 'Event', happyWindow.Event)
  define(globalThis, 'CustomEvent', happyWindow.CustomEvent)
  define(globalThis, 'MouseEvent', happyWindow.MouseEvent)
  define(globalThis, 'KeyboardEvent', happyWindow.KeyboardEvent)
  define(globalThis, 'InputEvent', happyWindow.InputEvent)
  define(globalThis, 'TouchEvent', happyWindow.TouchEvent)
  define(globalThis, 'PointerEvent', happyWindow.PointerEvent)
  define(globalThis, 'FormData', happyWindow.FormData)
  define(globalThis, 'File', happyWindow.File)
  define(globalThis, 'FileList', happyWindow.FileList)
  define(globalThis, 'Blob', happyWindow.Blob)
  define(globalThis, 'URL', happyWindow.URL)
  define(globalThis, 'URLSearchParams', happyWindow.URLSearchParams)

  define(globalThis, 'MutationObserver', happyWindow.MutationObserver)
  define(globalThis, 'IntersectionObserver', happyWindow.IntersectionObserver)
  define(globalThis, 'ResizeObserver', happyWindow.ResizeObserver)
  define(globalThis, 'PerformanceObserver', happyWindow.PerformanceObserver)

  for (const [key, value] of Object.entries(happyWindow)) {
    if (key.startsWith('HTML') && is.fn(value)) {
      define(globalThis, key, value)
    }
  }

  define(globalThis, 'globalThis', globalThis)

  define(globalThis, 'setTimeout', happyWindow.setTimeout)
  define(globalThis, 'clearTimeout', happyWindow.clearTimeout)
  define(globalThis, 'setInterval', happyWindow.setInterval)
  define(globalThis, 'clearInterval', happyWindow.clearInterval)

  define(globalThis, 'requestAnimationFrame', happyWindow.requestAnimationFrame)
  define(globalThis, 'cancelAnimationFrame', happyWindow.cancelAnimationFrame)
}

setupGlobals()

export const initDOM = () => {
  setupGlobals()
}

export const getDocument = () => happyDocument
export const getWindow = () => happyWindow
