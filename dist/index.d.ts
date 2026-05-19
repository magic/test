export { default as is } from '@magic/types'
export { default as deep } from '@magic/deep'
export { default as fs } from '@magic/fs'
export { default as error } from '@magic/error'
export { has } from './lib/has.js'
export { run } from './run.ts'
export { curry, env, http, mock, promise, vals, version, tryCatch } from './lib/index.ts'
export { initDOM, getDocument, getWindow } from './lib/dom/index.ts'
export * from './types.ts'
export declare const log: import('@magic/log').Log
export declare const isProd: boolean
export declare const isTest: boolean
export declare const isDev: boolean
