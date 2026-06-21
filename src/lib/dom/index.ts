import type { Window, Document } from 'happy-dom'

export {
  type SimpleEvent,
  type ImageInstance,
  type ImageConstructor,
  type CanvasRenderingContext2D,
  type CustomWindow,
} from './types.ts'

export { parsePngDimensions, createImagePolyfill } from './image.ts'

export { createCanvasPolyfill } from './canvas.ts'

import { initGlobals } from './globals.ts'

export { initGlobals }

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
