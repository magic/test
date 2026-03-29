#!/usr/bin/env node

import log from '@magic/log'
import is from '@magic/types'

import { run } from '../run.js'

import { maybeInjectMagic, readRecursive } from './lib/index.js'

const getShardConfig = () => {
  const rawShards = process.env.MAGIC_TEST_SHARDS
  const rawShardId = process.env.MAGIC_TEST_SHARD_ID

  const shards = Math.max(1, parseInt(rawShards || '1', 10)) || 1
  const shardId = Math.max(0, parseInt(rawShardId || '0', 10)) || 0

  if (rawShards && isNaN(parseInt(rawShards, 10))) {
    log.warn(`Invalid MAGIC_TEST_SHARDS: ${rawShards}, using default: 1`)
  }
  if (rawShardId && isNaN(parseInt(rawShardId, 10))) {
    log.warn(`Invalid MAGIC_TEST_SHARD_ID: ${rawShardId}, using default: 0`)
  }

  return { shards, shardId }
}

/**
 * @param {string} testPath
 * @param {number} totalShards
 * @returns {number}
 */
// Simple hash function to distribute tests deterministically
const getShardForTest = (testPath, totalShards) => {
  let hash = 0
  for (let i = 0; i < testPath.length; i++) {
    const char = testPath.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Ensure positive hash
  hash = Math.abs(hash)
  return hash % totalShards
}

const init = async () => {
  await maybeInjectMagic()

  const tests = await readRecursive()

  if (!tests) {
    log.error('NO tests specified')
    return
  }

  const { shards, shardId } = getShardConfig()

  const hasShardsEnv = 'MAGIC_TEST_SHARDS' in process.env
  const hasShardIdEnv = 'MAGIC_TEST_SHARD_ID' in process.env
  if (hasShardsEnv !== hasShardIdEnv) {
    log.warn('Both --shards and --shard-id should be specified together for consistent behavior')
  }

  // If no sharding, run all tests
  if (shards <= 1) {
    try {
      await run(tests)
    } catch (e) {
      const err = /** @type {CustomError} */ (e)
      err.code = 'E_MAGIC_TEST'
      log.error(err)
    }
    return
  }

  // Filter tests to only those assigned to this shard
  /** @type {any} */
  const filtered = Object.fromEntries(
    Object.entries(tests).filter(([key]) => {
      const shard = getShardForTest(key, shards)
      return shard === shardId
    }),
  )
  /** @type {TestSuites} */
  const shardTests = filtered

  if (Object.keys(shardTests).length === 0) {
    log.info(`Shard ${shardId} has no tests assigned`)
    return
  }

  log.info(
    `Running shard ${shardId + 1}/${shards} with ${Object.keys(shardTests).length} test suites`,
  )

  try {
    await run(shardTests)
  } catch (e) {
    const err = /** @type {CustomError} */ (e)
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
