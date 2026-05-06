#!/usr/bin/env node
import type { TestHooks, TestItem } from '../types.ts'
/**
 * Internal suite type for node-test-runner
 */
export interface RunnerSuite {
  name: string
  tests: TestItem[]
  hooks: TestHooks | Record<string, unknown>
}
declare const run: () => Promise<void>
export default run
