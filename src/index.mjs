import logging from '@magic/log'

export { default as is } from '@magic/types'
export { default as deep } from '@magic/deep'
export { default as fs } from '@magic/fs'

export { run } from './run.mjs'

export { curry, env, mock, promise, store, vals, version, tryCatch } from './lib/index.mjs'

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

export const log = logging

export const isProd = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'
export const isDev = process.env.NODE_ENV === 'development'

process
  .on('unhandledRejection', error => {
    log.error(error)
    process.exit(1)
  })
  .on('uncaughtException', error => {
    log.error(error)
    process.exit(1)
  })
