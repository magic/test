import logging from '@magic/log'
import is from '@magic/types'

export { default as is } from '@magic/types'
export { default as deep } from '@magic/deep'
export { default as fs } from '@magic/fs'
export { default as error } from '@magic/error'

export { run } from './run.ts'

import { initDOM } from './lib/dom/index.ts'

export { curry, env, http, mock, promise, vals, version, tryCatch } from './lib/index.ts'

export { initDOM, getDocument, getWindow } from './lib/dom/index.ts'

export * from './types.ts'

export {
  compileSvelte,
  mount,
  createSnippet,
  tick,
  html,
  text,
  component,
  props,
  fireEvent,
  click,
  dblClick,
  contextMenu,
  mouseDown,
  mouseUp,
  mouseMove,
  mouseEnter,
  mouseLeave,
  mouseOver,
  mouseOut,
  keyDown,
  keyPress,
  keyUp,
  type,
  input,
  change,
  blur,
  focus,
  focusIn,
  focusOut,
  submit,
  pointerDown,
  pointerUp,
  pointerMove,
  pointerOver,
  pointerOut,
  touchStart,
  touchEnd,
  touchMove,
  copy,
  cut,
  paste,
  dragStart,
  drag,
  dragEnd,
  dragOver,
  dragEnter,
  dragLeave,
  drop,
  resize,
  scroll,
  animationStart,
  animationEnd,
  animationIteration,
  transitionEnd,
  play,
  pause,
  ended,
  volumeChange,
  checked,
  trigger,
  testExportsPreprocessor,
  browser,
  dev,
  prod,
  createStaticPage,
} from './lib/svelte/index.ts'

// Auto-initialize DOM for all tests - makes HTMLInputElement, etc. available globally
// This enables instanceof checks to work in plain JS unit tests
initDOM()

const { NODE_ENV = 'test' } = process.env
process.env.NODE_ENV = NODE_ENV

export const log = logging

export const isProd = NODE_ENV === 'production'
export const isTest = NODE_ENV === 'test'
export const isDev = NODE_ENV === 'development'

/**
 * @param {'unhandledRejection' | 'uncaughtException'} type
 * @param {Error} err
 */
const handleError = (type: 'unhandledRejection' | 'uncaughtException', err: Error): void => {
  const prefix = type === 'unhandledRejection' ? 'Unhandled Rejection' : 'Uncaught Exception'
  log.error(`${prefix}:`, err)

  if (type === 'unhandledRejection') {
    process.exitCode = 1
  } else {
    process.exit(1)
  }
}

process.on('unhandledRejection', reason => {
  handleError('unhandledRejection', is.error(reason) ? reason : new Error(String(reason)))
})

process.on('uncaughtException', error => {
  handleError('uncaughtException', error)
})
