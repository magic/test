import type { Snapshot, TestResult } from '../types.js'
export declare class Isolation {
  private snapshots
  private suiteSnapshots
  constructor()
  /**
   * Improved deepClone: returns primitives, copies common built-ins.
   */
  deepClone<T>(value: T, seen?: WeakMap<object, unknown>): T
  /**
   * Build a snapshot: store descriptors, values (deep-cloned), and symbol keys
   */
  buildSnapshot(): Snapshot
  captureSuiteSnapshot(suiteKey: string): void
  restoreSuiteSnapshot(suiteKey: string): void
  restoreSnapshotFromMap(snapshotMap: Map<string, Snapshot>, key: string): void
  captureSnapshot(testKey: string): void
  restoreSnapshot(testKey: string): void
  /**
   * helper to map stringified symbol keys back to Symbol if needed
   */
  _reviveKeyFromString(keyStr: string): string | symbol
  /**
   * shouldCaptureProperty unchanged but include symbol type check
   */
  shouldCaptureProperty(prop: string | symbol): boolean
  executeSuiteIsolated<T>(suiteKey: string, fn: () => Promise<T>): Promise<T>
  executeIsolated<T>(testKey: string, fn: () => Promise<T>): Promise<T>
  /**
   * Run a test in a worker thread for true isolation
   */
  executeInWorker(options: {
    testFileUrl: string
    testIndex: number
    testPkg: string
    testParent: string
    testName: string
    suiteSnapshot?: Snapshot
    beforeAll?: string
    afterAll?: string
  }): Promise<TestResult>
  /**
   * Run multiple tests in a single worker for better performance
   */
  executeBatchInWorker(options: {
    testFileUrl: string
    testIndices: number[]
    testPkg: string
    testParent: string
    testNames: string[]
    suiteSnapshot?: Snapshot
    beforeAll?: string
    afterAll?: string
  }): Promise<TestResult[]>
}
/**
 * Apply a snapshot to the current globalThis context.
 * Deletes properties not in the snapshot, restores properties from snapshot.
 * Standalone version for use in worker threads.
 */
export declare const restoreFromSnapshot: (snapshot: Snapshot | null | undefined) => void
export declare const isolation: Isolation
