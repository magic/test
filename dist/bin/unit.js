#!/usr/bin/env node
// Register TypeScript loader before other imports
import './lib/registerLoader.js'
import log from '@magic/log'
import is from '@magic/types'
import { run, abort } from '../run.js'
import { maybeInjectMagic, readRecursive } from './lib/index.js'
const getShardConfig = () => {
  const rawShards = process.env.MAGIC_TEST_SHARDING_SHARDS
  const rawShardId = process.env.MAGIC_TEST_SHARDING_ID
  const shards = Math.max(1, parseInt(rawShards || '1', 10)) || 1
  const shardId = Math.max(0, parseInt(rawShardId || '0', 10)) || 0
  if (rawShards && isNaN(parseInt(rawShards, 10))) {
    log.warn(`Invalid MAGIC_TEST_SHARDING_SHARDS: ${rawShards}, using default: 1`)
  }
  if (rawShardId && isNaN(parseInt(rawShardId, 10))) {
    log.warn(`Invalid MAGIC_TEST_SHARDING_ID: ${rawShardId}, using default: 0`)
  }
  return { shards, shardId }
}
const init = async () => {
  await maybeInjectMagic()
  const tests = await readRecursive()
  if (!tests) {
    log.error('NO tests specified')
    return
  }
  const { shards, shardId } = getShardConfig()
  try {
    await run(tests, { shards, shardId })
  } catch (e) {
    const err = e
    err.code = 'E_MAGIC_TEST'
    log.error(err)
  }
}
init()
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
let shuttingDown = false
const shutdown = () => {
  if (shuttingDown) return
  shuttingDown = true
  log.warn('Received shutdown signal, aborting tests...')
  abort()
  setTimeout(() => {
    process.kill(process.pid, 'SIGKILL')
  }, 1000)
  process.exit(1)
}
process.on('SIGTERM', shutdown).on('SIGINT', shutdown)
