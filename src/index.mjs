export { default as log } from '@magic/log'
export { default as is } from '@magic/types'
export { default as deep } from '@magic/deep'

import runIt from './run.mjs'

export * from 'hyperapp'
export { curry, env, mock, promise, store, vals, version, tryCatch } from './lib/index.mjs'

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

export const run = runIt
export default runIt