#!/usr/bin/env node
import './lib/registerLoader.js'
export declare const getShardConfig: () => {
  shards: number
  shardId: number
  workers: number | undefined
}
export declare const handleError: (error: Error | string) => void
export declare const shutdown: () => Promise<never>
