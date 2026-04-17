import { Worker } from 'node:worker_threads'

import is from '@magic/types'

import type { Snapshot, PropertyDescriptorRecord, TestResult } from '../types.js'

const skipProps = [
  // Node/CommonJS built-ins
  'console',
  'process',
  'Buffer',
  'global',
  'globalThis',
  'window',
  'self',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'setImmediate',
  'clearImmediate',
  '__dirname',
  '__filename',
  'require',
  'module',
  'exports',
  // Constructors and intrinsics
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Date',
  'RegExp',
  'Error',
  'TypeError',
  'ReferenceError',
  'SyntaxError',
  'RangeError',
  'Promise',
  'Symbol',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'JSON',
  'Math',
  'Infinity',
  'NaN',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'decodeURI',
  'encodeURI',
  'decodeURIComponent',
  'encodeURIComponent',
  'escape',
  'unescape',
  // @magic/core globals (injected by maybeInjectMagic)
  'CHECK_PROPS',
  'modules',
  'actions',
  'effects',
  'helpers',
  'subscriptions',
  'lib',
  'renderToString',
  'compile',
  // DOM globals (from happy-dom, set by dom.js)
  'document',
  'navigator',
  'location',
  'history',
  'Node',
  'Element',
  'HTMLElement',
  'SVGElement',
  'Document',
  'DocumentFragment',
  'Comment',
  'Text',
  'Event',
  'CustomEvent',
  'MouseEvent',
  'KeyboardEvent',
  'InputEvent',
  'TouchEvent',
  'PointerEvent',
  'FormData',
  'File',
  'FileList',
  'Blob',
  'URL',
  'URLSearchParams',
  'MutationObserver',
  'IntersectionObserver',
  'ResizeObserver',
  'PerformanceObserver',
  // Typed arrays and buffers
  'ArrayBuffer',
  'DataView',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
  // Other built-ins
  'Reflect',
  'Proxy',
  'BigInt',
  'performance',
  // Additional globals that shouldn't be captured
  'Function',
  'eval',
  'WeakRef',
  'queueMicrotask',
  'FinalizationRegistry',
  'structuredClone',
  'atob',
  'btoa',
  'fetch',
  'DOMException',
]

export class Isolation {
  private snapshots: Map<string, Snapshot>
  private suiteSnapshots: Map<string, Snapshot>

  constructor() {
    this.snapshots = new Map()
    this.suiteSnapshots = new Map()
  }

  /**
   * Improved deepClone: returns primitives, copies common built-ins.
   */
  deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
    if (value === null || !is.object(value)) {
      return value
    }

    if (seen.has(value)) {
      return seen.get(value) as T
    }

    if (is.arr(value)) {
      const copy: unknown[] = []
      seen.set(value, copy)
      for (const v of value) {
        const cloned = this.deepClone(v, seen)
        // Skip functions; they cannot be transferred to workers
        if (!is.function(cloned)) {
          copy.push(cloned)
        }
      }
      return copy as T
    }

    if (is.date(value)) {
      return new Date(value.getTime()) as T
    }
    if (is.regex(value)) {
      return new RegExp(value.source, value.flags) as T
    }

    if (is.set(value)) {
      const out = new Set()
      seen.set(value, out)
      for (const v of value) {
        const cloned = this.deepClone(v, seen)
        // Skip functions
        if (!is.function(cloned)) {
          out.add(cloned)
        }
      }
      return out as T
    }
    if (is.map(value)) {
      const out = new Map()
      seen.set(value, out)
      for (const [k, v] of value) {
        const clonedK = this.deepClone(k, seen)
        const clonedV = this.deepClone(v, seen)
        // Skip entries where key or value is a function
        if (!is.function(clonedK) && !is.function(clonedV)) {
          out.set(clonedK, clonedV)
        }
      }
      return out as T
    }

    if (ArrayBuffer.isView(value)) {
      // TypedArray - cast via unknown to access slice
      return (value as unknown as { slice(): unknown }).slice() as T
    }

    if (value instanceof ArrayBuffer) {
      return value.slice() as T
    }

    if (is.error(value)) {
      return value as T
    }
    if (is.function(value)) {
      return value as T
    }

    const proto = Object.getPrototypeOf(value)
    const copy = Object.create(proto) as Record<string, unknown>
    seen.set(value, copy)

    const allKeys = [
      ...Object.getOwnPropertyNames(value),
      ...Object.getOwnPropertySymbols(value),
    ] as (string | symbol)[]

    for (const key of allKeys) {
      const desc = Object.getOwnPropertyDescriptor(value, key)
      if (!desc) continue

      if (desc.get || desc.set) {
        Object.defineProperty(copy, key, {
          configurable: !!desc.configurable,
          enumerable: !!desc.enumerable,
          get: desc.get,
          set: desc.set,
        })
      } else {
        // Skip function-valued data properties; they cannot be transferred to workers
        if (typeof desc.value === 'function') continue
        Object.defineProperty(copy, key, {
          configurable: !!desc.configurable,
          enumerable: !!desc.enumerable,
          writable: 'writable' in desc ? !!desc.writable : false,
          value: this.deepClone(desc.value, seen),
        })
      }
    }

    return copy as T
  }

  /**
   * Build a snapshot: store descriptors, values (deep-cloned), and symbol keys
   */
  buildSnapshot(): Snapshot {
    const snapshot: Snapshot = { props: {} }

    const allKeys = [
      ...Object.getOwnPropertyNames(globalThis),
      ...Object.getOwnPropertySymbols(globalThis),
    ] as (string | symbol)[]

    for (const key of allKeys) {
      if (!this.shouldCaptureProperty(key)) continue

      const desc = Object.getOwnPropertyDescriptor(globalThis, key)
      if (!desc) continue
      if (desc.configurable === false) continue

      // Skip function-valued data properties (cannot be cloned)
      if ('value' in desc && typeof desc.value === 'function') continue
      // Skip accessor properties (get/set are functions and cannot be cloned)
      if (desc.get || desc.set) continue

      const stored: PropertyDescriptorRecord = {
        configurable: !!desc.configurable,
        enumerable: !!desc.enumerable,
        writable: 'writable' in desc ? !!desc.writable : false,
      }

      if ('value' in desc) {
        try {
          stored.value = this.deepClone(desc.value)
        } catch (e) {
          console.warn('Isolation: failed to deep clone property value for', String(key), ':', e)
          stored.value = desc.value
        }
      } else {
        stored.get = desc.get
        stored.set = desc.set
      }

      snapshot.props[String(key)] = stored
    }

    return snapshot
  }

  captureSuiteSnapshot(suiteKey: string): void {
    try {
      const snapshot = this.buildSnapshot()
      this.suiteSnapshots.set(suiteKey, snapshot)
    } catch (e) {
      console.warn('Isolation: failed to capture suite snapshot for', suiteKey, ':', e)
      // Still ignore to not break tests, but make visible
    }
  }

  restoreSuiteSnapshot(suiteKey: string): void {
    this.restoreSnapshotFromMap(this.suiteSnapshots, suiteKey)
  }

  restoreSnapshotFromMap(snapshotMap: Map<string, Snapshot>, key: string): void {
    const snapshot = snapshotMap.get(key)
    if (!snapshot) return

    const currentNames = [
      ...Object.getOwnPropertyNames(globalThis),
      ...Object.getOwnPropertySymbols(globalThis),
    ] as (string | symbol)[]
    const snapshotNames = new Set(Object.keys(snapshot.props))

    for (const prop of currentNames) {
      if (!this.shouldCaptureProperty(prop)) continue
      if (!snapshotNames.has(String(prop))) {
        try {
          const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
          if (desc && desc.configurable !== false) {
            delete (globalThis as Record<string | symbol, unknown>)[prop]
          }
        } catch {
          // ignore
        }
      }
    }

    for (const keyStr in snapshot.props) {
      if (!Object.prototype.hasOwnProperty.call(snapshot.props, keyStr)) continue
      const stored = snapshot.props[keyStr]
      if (!stored) continue
      const prop = this._reviveKeyFromString(keyStr)
      try {
        const desc: PropertyDescriptor = {
          configurable: !!stored.configurable,
          enumerable: !!stored.enumerable,
        }
        if ('value' in stored) {
          desc.writable = !!stored.writable
          desc.value = stored.value
        } else {
          if (stored.get) desc.get = stored.get
          if (stored.set) desc.set = stored.set
        }
        Object.defineProperty(globalThis, prop as string, desc)
      } catch {
        try {
          if ('value' in stored && stored.value !== undefined) {
            ;(globalThis as Record<string | symbol, unknown>)[prop] = stored.value
          }
        } catch {
          // ignore
        }
      }
    }

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
   * helper to map stringified symbol keys back to Symbol if needed
   */
  _reviveKeyFromString(keyStr: string): string | symbol {
    if (keyStr.startsWith('Symbol(')) {
      const syms = Object.getOwnPropertySymbols(globalThis)
      for (const s of syms) {
        if (String(s) === keyStr) return s
      }
      return keyStr
    }
    return keyStr
  }

  /**
   * shouldCaptureProperty unchanged but include symbol type check
   */
  shouldCaptureProperty(prop: string | symbol): boolean {
    const name = is.symbol(prop) ? String(prop) : prop
    if (skipProps.includes(name)) return false

    const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
    if (!desc) return false
    if (desc.configurable === false) return false
    if ('value' in desc && typeof desc.value === 'function') return false
    if (desc.get || desc.set) return false
    return true
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
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./worker.js', import.meta.url), {
        workerData: {
          testFileUrl: options.testFileUrl,
          testIndex: options.testIndex,
          testPkg: options.testPkg,
          testParent: options.testParent,
          testName: options.testName,
          suiteSnapshot: options.suiteSnapshot,
        },
      })

      let settled = false
      worker.on('message', result => {
        if (settled) return
        settled = true
        resolve(result as TestResult)
      })
      worker.on('error', err => {
        if (settled) return
        settled = true
        reject(err)
      })
      worker.on('exit', code => {
        if (settled) return
        if (code !== 0) {
          settled = true
          reject(new Error(`Worker exited with code ${code}`))
        }
      })
    })
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
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./worker.js', import.meta.url), {
        workerData: {
          testFileUrl: options.testFileUrl,
          testIndices: options.testIndices,
          testPkg: options.testPkg,
          testParent: options.testParent,
          testNames: options.testNames,
          suiteSnapshot: options.suiteSnapshot,
          batchMode: true,
        },
      })

      let settled = false
      worker.on('message', result => {
        if (settled) return
        settled = true
        resolve(result as TestResult[])
      })
      worker.on('error', err => {
        if (settled) return
        settled = true
        reject(err)
      })
      worker.on('exit', code => {
        if (settled) return
        if (code !== 0) {
          settled = true
          reject(new Error(`Worker exited with code ${code}`))
        }
      })
    })
  }
}

/**
 * Apply a snapshot to the current globalThis context.
 * Deletes properties not in the snapshot, restores properties from snapshot.
 * Standalone version for use in worker threads.
 */
export const restoreFromSnapshot = (snapshot: Snapshot | null | undefined): void => {
  if (!snapshot) return

  const currentNames = [
    ...Object.getOwnPropertyNames(globalThis),
    ...Object.getOwnPropertySymbols(globalThis),
  ] as (string | symbol)[]
  const snapshotNames = new Set(Object.keys(snapshot.props))

  for (const prop of currentNames) {
    if (!isolation.shouldCaptureProperty(prop)) continue
    if (!snapshotNames.has(String(prop))) {
      try {
        const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
        if (desc && desc.configurable !== false) {
          delete (globalThis as Record<string | symbol, unknown>)[prop]
        }
      } catch {
        // ignore
      }
    }
  }

  for (const keyStr in snapshot.props) {
    if (!Object.prototype.hasOwnProperty.call(snapshot.props, keyStr)) continue
    const stored = snapshot.props[keyStr]
    if (!stored) continue
    const prop = isolation._reviveKeyFromString(keyStr)
    try {
      const desc: PropertyDescriptor = {
        configurable: !!stored.configurable,
        enumerable: !!stored.enumerable,
      }
      if ('value' in stored) {
        desc.writable = !!stored.writable
        desc.value = stored.value
      } else {
        if (stored.get) desc.get = stored.get
        if (stored.set) desc.set = stored.set
      }
      Object.defineProperty(globalThis, prop as string, desc)
    } catch {
      try {
        if ('value' in stored && stored.value !== undefined) {
          ;(globalThis as Record<string | symbol, unknown>)[prop] = stored.value
        }
      } catch {
        // ignore
      }
    }
  }
}

export const isolation = new Isolation()
