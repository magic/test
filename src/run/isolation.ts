/* ---------------------------------------------------------------------------
 * Isolation facade.
 *
 * Owns the per-test / per-suite snapshot state and the set of active workers.
 * The actual work is delegated to focused modules:
 *
 * - lib/isolation/snapshot.ts: globalThis snapshot/restore primitives
 * - lib/isolation/worker.ts:   worker-thread execution
 * - lib/isolation/skipProps.ts: globals excluded from snapshots
 * -------------------------------------------------------------------------- */

import { Worker } from 'node:worker_threads'
import log from '@magic/log'

import {
  deepClone as deepCloneGlobal,
  shouldCaptureProperty as shouldCapture,
  buildSnapshot as buildGlobalSnapshot,
  restoreProperties as restoreGlobalProperties,
  reviveKeyFromString as reviveKey,
} from './lib/isolation/snapshot.ts'
import {
  executeInWorker as runInWorker,
  executeBatchInWorker as runBatchInWorker,
} from './lib/isolation/worker.ts'

import type { Snapshot, TestResult } from '../types.ts'

export class Isolation {
  private snapshots: Map<string, Snapshot>
  private suiteSnapshots: Map<string, Snapshot>
  private activeWorkers: Set<Worker>

  constructor() {
    this.snapshots = new Map()
    this.suiteSnapshots = new Map()
    this.activeWorkers = new Set()
  }

  /**
   * Terminate all active workers. Call this on shutdown.
   */
  async terminateAllWorkers(): Promise<void> {
    await Promise.all(Array.from(this.activeWorkers).map(worker => worker.terminate()))
    this.activeWorkers.clear()
  }

  /**
   * Improved deepClone: returns primitives, copies common built-ins.
   */
  deepClone<T>(value: T, seen?: WeakMap<object, unknown>): T {
    return deepCloneGlobal(value, seen)
  }

  /**
   * Build a snapshot of the current globalThis.
   */
  buildSnapshot(): Snapshot {
    return buildGlobalSnapshot()
  }

  captureSuiteSnapshot(suiteKey: string): void {
    try {
      const snapshot = this.buildSnapshot()
      this.suiteSnapshots.set(suiteKey, snapshot)
    } catch (e) {
      log.warn('Isolation: failed to capture suite snapshot for', suiteKey, ':', e)
      // Still ignore to not break tests, but make visible
    }
  }

  restoreSuiteSnapshot(suiteKey: string): void {
    this.restoreSnapshotFromMap(this.suiteSnapshots, suiteKey)
  }

  /**
   * Restore properties from a snapshot to globalThis.
   */
  restoreProperties(snapshot: Snapshot): void {
    restoreGlobalProperties(snapshot)
  }

  restoreSnapshotFromMap(snapshotMap: Map<string, Snapshot>, key: string): void {
    const snapshot = snapshotMap.get(key)
    if (!snapshot) {
      return
    }

    this.restoreProperties(snapshot)
    snapshotMap.delete(key)
  }

  captureSnapshot(testKey: string): void {
    try {
      const snapshot = this.buildSnapshot()
      this.snapshots.set(testKey, snapshot)
    } catch {
      // ignore
    }
  }

  restoreSnapshot(testKey: string): void {
    this.restoreSnapshotFromMap(this.snapshots, testKey)
  }

  /**
   * helper to map stringified symbol keys back to Symbol if needed.
   */
  _reviveKeyFromString(keyStr: string): string | symbol {
    return reviveKey(keyStr)
  }

  /**
   * shouldCaptureProperty: O(1) lookup using Set.has()
   */
  shouldCaptureProperty(prop: string | symbol): boolean {
    return shouldCapture(prop)
  }

  async executeSuiteIsolated<T>(suiteKey: string, fn: () => Promise<T>): Promise<T> {
    this.captureSuiteSnapshot(suiteKey)
    try {
      return await fn()
    } finally {
      this.restoreSuiteSnapshot(suiteKey)
    }
  }

  async executeIsolated<T>(testKey: string, fn: () => Promise<T>): Promise<T> {
    this.captureSnapshot(testKey)
    try {
      return await fn()
    } finally {
      this.restoreSnapshot(testKey)
    }
  }

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
  }): Promise<TestResult> {
    return runInWorker(options, this.activeWorkers)
  }

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
  }): Promise<TestResult[]> {
    return runBatchInWorker(options, this.activeWorkers)
  }
}

/**
 * Apply a snapshot to the current globalThis context.
 * Deletes properties not in the snapshot, restores properties from snapshot.
 * Standalone version for use in worker threads.
 */
export const restoreFromSnapshot = (snapshot: Snapshot | null | undefined): void => {
  if (!snapshot) {
    return
  }
  isolation.restoreProperties(snapshot)
}

export const isolation = new Isolation()
