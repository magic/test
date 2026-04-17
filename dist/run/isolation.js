import { Worker } from 'node:worker_threads'
import os from 'node:os'
import is from '@magic/types'
const MAX_WORKERS = Math.max(1, os.cpus().length - 2)
const workerQueue = []
const activeWorkers = new Set()
const runWorker = () => {
  if (workerQueue.length === 0) return
  const task = workerQueue.shift()
  if (!task) return
  activeWorkers.add(task.worker)
  task.worker.on('message', result => {
    task.resolve(result)
  })
  task.worker.on('error', err => {
    task.reject(err)
  })
  task.worker.on('exit', code => {
    activeWorkers.delete(task.worker)
    if (code !== 0) {
      task.reject(new Error(`Worker exited with code ${code}`))
    }
    runWorker()
  })
}
const enqueueWorker = task => {
  workerQueue.push(task)
  if (activeWorkers.size < MAX_WORKERS) {
    runWorker()
  }
}
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
  'undefined',
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
  snapshots
  suiteSnapshots
  constructor() {
    this.snapshots = new Map()
    this.suiteSnapshots = new Map()
  }
  /**
   * Improved deepClone: returns primitives, copies common built-ins.
   */
  deepClone(value, seen = new WeakMap()) {
    if (value === null || !is.object(value)) {
      return value
    }
    if (seen.has(value)) {
      return seen.get(value)
    }
    if (is.arr(value)) {
      const copy = []
      seen.set(value, copy)
      for (const v of value) {
        const cloned = this.deepClone(v, seen)
        // Skip functions; they cannot be transferred to workers
        if (!is.function(cloned)) {
          copy.push(cloned)
        }
      }
      return copy
    }
    if (is.date(value)) {
      return new Date(value.getTime())
    }
    if (is.regex(value)) {
      return new RegExp(value.source, value.flags)
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
      return out
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
      return out
    }
    if (ArrayBuffer.isView(value)) {
      // TypedArray - cast via unknown to access slice
      return value.slice()
    }
    if (value instanceof ArrayBuffer) {
      return value.slice()
    }
    if (is.error(value)) {
      return value
    }
    if (is.function(value)) {
      return value
    }
    const proto = Object.getPrototypeOf(value)
    const copy = Object.create(proto)
    seen.set(value, copy)
    const allKeys = [...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value)]
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
        if (is.function(desc.value)) continue
        Object.defineProperty(copy, key, {
          configurable: !!desc.configurable,
          enumerable: !!desc.enumerable,
          writable: 'writable' in desc ? !!desc.writable : false,
          value: this.deepClone(desc.value, seen),
        })
      }
    }
    return copy
  }
  /**
   * Build a snapshot: store descriptors, values (deep-cloned), and symbol keys
   */
  buildSnapshot() {
    const snapshot = { props: {} }
    const allKeys = [
      ...Object.getOwnPropertyNames(globalThis),
      ...Object.getOwnPropertySymbols(globalThis),
    ]
    for (const key of allKeys) {
      if (!this.shouldCaptureProperty(key)) continue
      const desc = Object.getOwnPropertyDescriptor(globalThis, key)
      if (!desc) continue
      if (desc.configurable === false) continue
      // Skip function-valued data properties (cannot be cloned)
      if ('value' in desc && is.function(desc.value)) continue
      // Skip accessor properties (get/set are functions and cannot be cloned)
      if (desc.get || desc.set) continue
      const stored = {
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
  captureSuiteSnapshot(suiteKey) {
    try {
      const snapshot = this.buildSnapshot()
      this.suiteSnapshots.set(suiteKey, snapshot)
    } catch (e) {
      console.warn('Isolation: failed to capture suite snapshot for', suiteKey, ':', e)
      // Still ignore to not break tests, but make visible
    }
  }
  restoreSuiteSnapshot(suiteKey) {
    this.restoreSnapshotFromMap(this.suiteSnapshots, suiteKey)
  }
  restoreSnapshotFromMap(snapshotMap, key) {
    const snapshot = snapshotMap.get(key)
    if (!snapshot) return
    const currentNames = [
      ...Object.getOwnPropertyNames(globalThis),
      ...Object.getOwnPropertySymbols(globalThis),
    ]
    const snapshotNames = new Set(Object.keys(snapshot.props))
    for (const prop of currentNames) {
      if (!this.shouldCaptureProperty(prop)) continue
      if (!snapshotNames.has(String(prop))) {
        try {
          const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
          if (desc && desc.configurable !== false) {
            delete globalThis[prop]
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
        const desc = {
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
        Object.defineProperty(globalThis, prop, desc)
      } catch {
        try {
          if ('value' in stored && stored.value !== undefined) {
            globalThis[prop] = stored.value
          }
        } catch {
          // ignore
        }
      }
    }
    snapshotMap.delete(key)
  }
  captureSnapshot(testKey) {
    try {
      const snapshot = this.buildSnapshot()
      this.snapshots.set(testKey, snapshot)
    } catch {
      // ignore
    }
  }
  restoreSnapshot(testKey) {
    this.restoreSnapshotFromMap(this.snapshots, testKey)
  }
  /**
   * helper to map stringified symbol keys back to Symbol if needed
   */
  _reviveKeyFromString(keyStr) {
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
  shouldCaptureProperty(prop) {
    const name = is.symbol(prop) ? String(prop) : prop
    if (skipProps.includes(name)) return false
    const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
    if (!desc) return false
    if (desc.configurable === false) return false
    if ('value' in desc && is.function(desc.value)) return false
    if (desc.get || desc.set) return false
    return true
  }
  async executeSuiteIsolated(suiteKey, fn) {
    this.captureSuiteSnapshot(suiteKey)
    try {
      return await fn()
    } finally {
      this.restoreSuiteSnapshot(suiteKey)
    }
  }
  async executeIsolated(testKey, fn) {
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
  executeInWorker(options) {
    return new Promise((resolve, reject) => {
      const workerData = {
        testFileUrl: options.testFileUrl,
        testPkg: options.testPkg,
        testParent: options.testParent,
        testName: options.testName,
      }
      if (options.testIndex !== undefined) {
        workerData.testIndex = options.testIndex
      }
      if (options.testIndices !== undefined) {
        workerData.testIndices = options.testIndices
      }
      if (options.suiteSnapshot !== undefined) {
        workerData.suiteSnapshot = options.suiteSnapshot
      }
      const worker = new Worker(new URL('./worker.js', import.meta.url), {
        workerData,
      })
      enqueueWorker({
        resolve,
        reject,
        worker,
      })
    })
  }
}
/**
 * Apply a snapshot to the current globalThis context.
 * Deletes properties not in the snapshot, restores properties from snapshot.
 * Standalone version for use in worker threads.
 */
export const restoreFromSnapshot = snapshot => {
  if (!snapshot) return
  const currentNames = [
    ...Object.getOwnPropertyNames(globalThis),
    ...Object.getOwnPropertySymbols(globalThis),
  ]
  const snapshotNames = new Set(Object.keys(snapshot.props))
  for (const prop of currentNames) {
    if (!isolation.shouldCaptureProperty(prop)) continue
    if (!snapshotNames.has(String(prop))) {
      try {
        const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
        if (desc && desc.configurable !== false) {
          delete globalThis[prop]
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
      const desc = {
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
      Object.defineProperty(globalThis, prop, desc)
    } catch {
      try {
        if ('value' in stored && stored.value !== undefined) {
          globalThis[prop] = stored.value
        }
      } catch {
        // ignore
      }
    }
  }
}
export const isolation = new Isolation()
