#!/usr/bin/env node

// Register TypeScript loader before other imports
import './lib/registerLoader.ts'

import log from '@magic/log'
import is from '@magic/types'

import { run, abort } from '../run.ts'

import { maybeInjectMagic, readRecursive } from './lib/index.ts'

import type { TestSuites } from '../types.ts'
import type { CustomError } from '@magic/error'

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

// FNV-1a hash function for better distribution
const getShardForTest = (testPath: string, totalShards: number): number => {
  let hash = 2166136261 // FNV offset basis
  for (let i = 0; i < testPath.length; i++) {
    hash ^= testPath.charCodeAt(i)
    hash = Math.imul(hash, 16777619) // FNV prime
  }
  // Ensure positive and within range
  return (hash >>> 0) % totalShards
}

const init = async () => {
  await maybeInjectMagic()

  const tests = await readRecursive()

  if (!tests) {
    log.error('NO tests specified')
    return
  }

  const { shards, shardId } = getShardConfig()

  const hasShardsEnv = 'MAGIC_TEST_SHARDING_SHARDS' in process.env
  const hasShardIdEnv = 'MAGIC_TEST_SHARDING_ID' in process.env
  if (hasShardsEnv !== hasShardIdEnv) {
    log.warn('Both --shards and --shard-id should be specified together for consistent behavior')
  }

  // If no sharding, run all tests
  if (shards <= 1) {
    try {
      await run(tests)
    } catch (e: unknown) {
      const err = e as CustomError
      err.code = 'E_MAGIC_TEST'
      log.error(err)
    }
    return
  }

  // Filter tests to only those assigned to this shard
  const shardTests = Object.fromEntries(
    Object.entries(tests).filter(([key]) => {
      const shard = getShardForTest(key, shards)
      return shard === shardId
    }),
  ) as TestSuites

  if (Object.keys(shardTests).length === 0) {
    log.info(`Shard ${shardId} has no tests assigned`)
    return
  }

  log.info(
    `Running shard ${shardId + 1}/${shards} with ${Object.keys(shardTests).length} test suites`,
  )

  try {
    await run(shardTests)
  } catch (e: unknown) {
    const err = e as CustomError
    err.code = 'E_MAGIC_TEST'
    log.error(err)
  }
}

init()

const handleError = (error: Error | string): void => {
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

const shutdown = async () => {
  log.warn('Received shutdown signal, aborting tests...')
  await abort()
  process.exit(1)
}

process.on('SIGTERM', shutdown).on('SIGINT', shutdown)
