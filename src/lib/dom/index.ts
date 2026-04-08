import type { CustomWindow } from './types.ts'

export {
  type SimpleEvent,
  type ImageInstance,
  type ImageConstructor,
  type CanvasRenderingContext2D,
  type CustomWindow,
} from './types.ts'

export { imageCache, parsePngDimensions, createImagePolyfill } from './image.ts'

export { createCanvasPolyfill } from './canvas.ts'

import { happyWindow, happyDocument, define, initGlobals } from './globals.ts'

export { happyWindow, happyDocument, define, initGlobals }

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
