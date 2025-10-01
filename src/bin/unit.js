#!/usr/bin/env node

import log from '@magic/log'
import is from '@magic/types'

import { run } from '../run.js'

import { maybeInjectMagic, readRecursive } from './lib/index.js'

const init = async () => {
  await maybeInjectMagic()

  const tests = await readRecursive()

  if (!tests) {
    log.error('NO tests specified')
    return
  }

  try {
    await run(tests)
  } catch (e) {
    const err = /** @type {import('@magic/error').CustomError} */ (e)
    err.code = 'E_MAGIC_TEST'
    log.error(err)
  }
}

init()

/**
 *
 * @param {Error} error
 */
const handleError = error => {
  if (is.string(error)) {
    error = new Error(error)
  }

  log.error(error.name, error.message)

  if (error.stack) {
    const stack = error.stack.replace(error.name, '').replace(error.message, '')
    log.warn('stacktrace', stack)
  }

  process.exit(1)
}

process.on('unhandledRejection', handleError).on('uncaughtException', handleError)
