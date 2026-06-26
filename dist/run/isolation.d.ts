import type { Snapshot, TestResult } from '../types.ts'
export declare class Isolation {
  private snapshots
  private suiteSnapshots
  private activeWorkers
  private symbolCache
  constructor()
  /**
   * Terminate all active workers. Call this on shutdown.
   */
  terminateAllWorkers(): Promise<void>
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
   * Uses cache for O(1) repeated lookups
   */
  _reviveKeyFromString(keyStr: string): string | symbol
  /**
   * shouldCaptureProperty: O(1) lookup using Set.has()
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
  }): Promise<TestResult[]>
}
/**
 * Apply a snapshot to the current globalThis context.
 * Deletes properties not in the snapshot, restores properties from snapshot.
 * Standalone version for use in worker threads.
 */
export declare const restoreFromSnapshot: (snapshot: Snapshot | null | undefined) => void
export declare const isolation: Isolation
