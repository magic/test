import logging from '@magic/log'

export { default as is } from '@magic/types'
export { default as deep } from '@magic/deep'
export { default as fs } from '@magic/fs'
export { default as error } from '@magic/error'

export { run } from './run.mjs'

export { curry, env, http, mock, promise, store, vals, version, tryCatch } from './lib/index.mjs'

const { NODE_ENV = 'test' } = process.env
// the logging library reads process.env
process.env.NODE_ENV = NODE_ENV

export const log = logging

export const isProd = NODE_ENV === 'production'
export const isTest = NODE_ENV === 'test'
export const isDev = NODE_ENV === 'development'

process
  .on('unhandledRejection', error => {
    log.error(error)
    process.exit(1)
  })
  .on('uncaughtException', error => {
    log.error(error)
    process.exit(1)
  })
