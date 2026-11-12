#!/usr/bin/env node
import './lib/registerLoader.js'
export declare const getShardConfig: () => {
  shards: number
  shardId: number
  workers: number | undefined
}
/**
 * Parse MAGIC_TEST_EXCLUDE (JSON array of CLI --exclude patterns) set by the
 * t.ts CLI. Used to exclude declaration files from the auto-generated .d.ts
 * type-check suites. Invalid/absent values yield an empty list.
 */
export declare const getDtsExcludes: () => string[]
export declare const handleError: (error: Error | string) => void
export declare const shutdown: () => Promise<never>
