export { imageCache, parsePngDimensions, createImagePolyfill } from './image.js'
export { createCanvasPolyfill } from './canvas.js'
import { define, initGlobals } from './globals.js'
export { define, initGlobals }
export const initDOM = () => {
  return initGlobals()
}
export const getDocument = () => {
  const { document } = initGlobals()
  return document
}
export const getWindow = () => {
  const { window } = initGlobals()
  return window
}
