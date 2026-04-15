import type { Window, Document } from 'happy-dom'

export {
  type SimpleEvent,
  type ImageInstance,
  type ImageConstructor,
  type CanvasRenderingContext2D,
  type CustomWindow,
} from './types.ts'

export { imageCache, parsePngDimensions, createImagePolyfill } from './image.js'

export { createCanvasPolyfill } from './canvas.js'

import { define, initGlobals } from './globals.js'

export { define, initGlobals }

export const initDOM = (): { window: Window; document: Document } => {
  return initGlobals()
}

export const getDocument = (): Document => {
  const { document } = initGlobals()
  return document
}

export const getWindow = (): Window => {
  const { window } = initGlobals()
  return window
}
