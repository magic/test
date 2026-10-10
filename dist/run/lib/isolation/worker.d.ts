import { Worker } from 'node:worker_threads'
import type { Snapshot, TestResult } from '../../../types.js'
/**
 * Run a single test in a worker thread for true isolation.
 */
export declare const executeInWorker: (
  options: {
    testFileUrl: string
    testIndex: number
    testPkg: string
    testParent: string
    testName: string
    suiteSnapshot?: Snapshot
  },
  activeWorkers: Set<Worker>,
) => Promise<TestResult>
/**
 * Run multiple tests in a single worker for better performance.
 */
export declare const executeBatchInWorker: (
  options: {
    testFileUrl: string
    testIndices: number[]
    testPkg: string
    testParent: string
    testNames: string[]
    suiteSnapshot?: Snapshot
  },
  activeWorkers: Set<Worker>,
) => Promise<TestResult[]>
