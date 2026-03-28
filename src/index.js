import logging from '@magic/log'

export { default as is } from '@magic/types'
export { default as deep } from '@magic/deep'
export { default as fs } from '@magic/fs'
export { default as error } from '@magic/error'

export { run } from './run.js'

export { curry, env, http, mock, promise, Store, vals, version, tryCatch } from './lib/index.js'

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
const handleError = (type, err) => {
  const prefix = type === 'unhandledRejection' ? 'Unhandled Rejection' : 'Uncaught Exception'
  log.error(`${prefix}:`, err)

  if (type === 'unhandledRejection') {
    process.exitCode = 1
  } else {
    process.exit(1)
  }
}

process.on('unhandledRejection', reason => {
  handleError('unhandledRejection', reason instanceof Error ? reason : new Error(String(reason)))
})

process.on('uncaughtException', error => {
  handleError('uncaughtException', error)
})
