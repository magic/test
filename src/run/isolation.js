import { Worker } from 'node:worker_threads'

import is from '@magic/types'

/** @typedef {import('../types.ts').Snapshot} Snapshot */
/** @typedef {import('../types.ts').PropertyDescriptorRecord} PropertyDescriptorRecord */
/** @typedef {import('../types.ts').TestResult} TestResult */

/**
 * @typedef {ArrayBuffer | Uint8Array | Uint8ClampedArray | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} SliceableBuffer
 */

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
  constructor() {
    /** @type {Map<string, Snapshot>} */
    this.snapshots = new Map()
    /** @type {Map<string, Snapshot>} */
    this.suiteSnapshots = new Map()
  }

  /**
   * Improved deepClone: returns primitives, copies common built-ins.
   * @template T
   * @param {T} value
   * @param {WeakMap<object, unknown>} [seen]
   * @returns {T}
   */
  deepClone(value, seen = new WeakMap()) {
    if (value === null || !is.object(value)) {
      return value
    }

    if (seen.has(value)) {
      return /** @type {T} */ (seen.get(value))
    }

    if (is.arr(value)) {
      /** @type {unknown[]} */
      const copy = []
      seen.set(value, copy)
      for (const v of value) {
        const cloned = this.deepClone(v, seen)
        // Skip functions; they cannot be transferred to workers
        if (!is.function(cloned)) {
          copy.push(cloned)
        }
      }

      return /** @type {T} */ (copy)
    }

    if (is.date(value)) {
      return /** @type {T} */ (new Date(value.getTime()))
    }
    if (is.regex(value)) {
      return /** @type {T} */ (new RegExp(value.source, value.flags))
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
      return /** @type {T} */ (out)
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
      return /** @type {T} */ (out)
    }

    if (ArrayBuffer.isView(value)) {
      // TypedArray - cast to any to access slice, then cast result back
      const result = /** @type {any} */ (value).slice()
      return /** @type {T} */ (result)
    }

    if (is.instance(value, ArrayBuffer)) {
      // ArrayBuffer has slice method
      const result = /** @type {any} */ (value).slice()
      return /** @type {T} */ (result)
    }

    if (is.error(value)) {
      return /** @type {T} */ (value)
    }
    if (is.function(value)) {
      return /** @type {T} */ (value)
    }

    const proto = Object.getPrototypeOf(value)
    const copy = Object.create(proto)
    seen.set(value, copy)

    /** @type {(string | symbol)[]} */
    const allKeys = /** @type {(string | symbol)[]} */ (Object.getOwnPropertyNames(value)).concat(
      Object.getOwnPropertySymbols(value),
    )

    for (const key of allKeys) {
      const desc = Object.getOwnPropertyDescriptor(value, key)
      if (!desc) continue

      if (desc.get || desc.set) {
        Object.defineProperty(copy, key, {
          configurable: desc.configurable,
          enumerable: desc.enumerable,
          get: desc.get,
          set: desc.set,
        })
      } else {
        // Skip function-valued data properties; they cannot be transferred to workers
        if (typeof desc.value === 'function') continue
        Object.defineProperty(copy, key, {
          configurable: desc.configurable,
          enumerable: desc.enumerable,
          writable: 'writable' in desc ? !!desc.writable : undefined,
          value: this.deepClone(desc.value, seen),
        })
      }
    }

    return copy
  }

  /**
   * Build a snapshot: store descriptors, values (deep-cloned), and symbol keys
   * @returns {Snapshot}
   */
  buildSnapshot() {
    /** @type {Snapshot} */
    const snapshot = { props: {} }

    const propNames = Object.getOwnPropertyNames(globalThis)
    const symNames = Object.getOwnPropertySymbols(globalThis)
    /** @type {(string | symbol)[]} */
    const allKeys = /** @type {(string | symbol)[]} */ (propNames).concat(symNames)

    for (const key of allKeys) {
      if (!this.shouldCaptureProperty(key)) continue

      const desc = Object.getOwnPropertyDescriptor(globalThis, key)
      if (!desc) continue
      if (desc.configurable === false) continue

      // Skip function-valued data properties (cannot be cloned)
      if ('value' in desc && typeof desc.value === 'function') continue
      // Skip accessor properties (get/set are functions and cannot be cloned)
      if (desc.get || desc.set) continue

      /** @type {PropertyDescriptorRecord} */
      const stored = {
        configurable: !!desc.configurable,
        enumerable: !!desc.enumerable,
        writable: 'writable' in desc ? !!desc.writable : undefined,
        value: undefined,
        get: undefined,
        set: undefined,
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

  /**
   * @param {string} suiteKey
   * @returns {void}
   */
  captureSuiteSnapshot(suiteKey) {
    try {
      const snapshot = this.buildSnapshot()
      this.suiteSnapshots.set(suiteKey, snapshot)
    } catch (e) {
      console.warn('Isolation: failed to capture suite snapshot for', suiteKey, ':', e)
      // Still ignore to not break tests, but make visible
    }
  }

  /**
   * @param {string} suiteKey
   * @returns {void}
   */
  restoreSuiteSnapshot(suiteKey) {
    this.restoreSnapshotFromMap(this.suiteSnapshots, suiteKey)
  }

  /**
   * @param {Map<string, Snapshot>} snapshotMap
   * @param {string} key
   * @returns {void}
   */
  restoreSnapshotFromMap(snapshotMap, key) {
    const snapshot = snapshotMap.get(key)
    if (!snapshot) return

    /** @type {(string | symbol)[]} */
    const currentNames = /** @type {(string | symbol)[]} */ (
      Object.getOwnPropertyNames(globalThis)
    ).concat(Object.getOwnPropertySymbols(globalThis))
    const snapshotNames = new Set(Object.keys(snapshot.props))

    for (const prop of currentNames) {
      if (!this.shouldCaptureProperty(prop)) continue
      if (!snapshotNames.has(String(prop))) {
        try {
          const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
          if (desc && desc.configurable !== false) {
            // @ts-expect-error - dynamic property delete on globalThis, prop is validated as string
            delete globalThis[/** @type {string} */ (prop)]
          }
        } catch {
          // ignore
        }
      }
    }

    for (const [keyStr, stored] of Object.entries(snapshot.props)) {
      const prop = this._reviveKeyFromString(keyStr)
      try {
        /** @type {PropertyDescriptor} */
        const desc = {}
        desc.configurable = !!stored.configurable
        desc.enumerable = !!stored.enumerable
        if ('value' in stored) {
          desc.writable = !!stored.writable
          desc.value = stored.value
        } else {
          desc.get = stored.get
          desc.set = stored.set
        }
        Object.defineProperty(globalThis, prop, desc)
      } catch {
        try {
          const global = /** @type {Record<string, unknown>} */ (globalThis)
          global[/** @type {string} */ (prop)] = stored.value
        } catch {
          // ignore
        }
      }
    }

    snapshotMap.delete(key)
  }

  /**
   * @param {string} testKey
   * @returns {void}
   */
  captureSnapshot(testKey) {
    try {
      const snapshot = this.buildSnapshot()
      this.snapshots.set(testKey, snapshot)
    } catch {
      // ignore
    }
  }

  /**
   * @param {string} testKey
   * @returns {void}
   */
  restoreSnapshot(testKey) {
    this.restoreSnapshotFromMap(this.snapshots, testKey)
  }

  /**
   * helper to map stringified symbol keys back to Symbol if needed
   * @param {string} keyStr
   * @returns {string | symbol}
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
   * @param {string | symbol} prop
   * @returns {boolean}
   */
  shouldCaptureProperty(prop) {
    const name = is.symbol(prop) ? String(prop) : prop
    if (skipProps.includes(name)) return false

    const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
    if (!desc) return false
    if (desc.configurable === false) return false
    if ('value' in desc && typeof desc.value === 'function') return false
    if (desc.get || desc.set) return false
    return true
  }

  /**
   * @template T
   * @param {string} suiteKey
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
  async executeSuiteIsolated(suiteKey, fn) {
    this.captureSuiteSnapshot(suiteKey)
    try {
      return await fn()
    } finally {
      this.restoreSuiteSnapshot(suiteKey)
    }
  }

  /**
   * @template T
   * @param {string} testKey
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
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
   * @param {object} options
   * @param {string} options.testFileUrl
   * @param {number} options.testIndex
   * @param {string} options.testPkg
   * @param {string} options.testParent
   * @param {string} options.testName
   * @param {Snapshot} [options.suiteSnapshot]
   * @returns {Promise<TestResult>}
   */
  executeInWorker({ testFileUrl, testIndex, testPkg, testParent, testName, suiteSnapshot }) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./worker.js', import.meta.url), {
        workerData: { testFileUrl, testIndex, testPkg, testParent, testName, suiteSnapshot },
      })

      let settled = false
      worker.on('message', result => {
        if (settled) return
        settled = true
        resolve(result)
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
 * @param {Snapshot} snapshot
 * @returns {void}
 */
export const restoreFromSnapshot = snapshot => {
  if (!snapshot) return

  const currentNames = /** @type {(string | symbol)[]} */ (
    Object.getOwnPropertyNames(globalThis)
  ).concat(Object.getOwnPropertySymbols(globalThis))
  const snapshotNames = new Set(Object.keys(snapshot.props))

  for (const prop of currentNames) {
    if (!isolation.shouldCaptureProperty(prop)) continue
    if (!snapshotNames.has(String(prop))) {
      try {
        const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
        if (desc && desc.configurable !== false) {
          // @ts-expect-error - dynamic property delete on globalThis, prop is validated as string
          delete globalThis[/** @type {string} */ (prop)]
        }
      } catch {
        // ignore
      }
    }
  }

  for (const [keyStr, stored] of Object.entries(snapshot.props)) {
    const prop = isolation._reviveKeyFromString(keyStr)
    try {
      /** @type {PropertyDescriptor} */
      const desc = {}
      desc.configurable = !!stored.configurable
      desc.enumerable = !!stored.enumerable
      if ('value' in stored) {
        desc.writable = !!stored.writable
        desc.value = stored.value
      } else {
        desc.get = stored.get
        desc.set = stored.set
      }
      Object.defineProperty(globalThis, prop, desc)
    } catch {
      try {
        const global = /** @type {Record<string, unknown>} */ (globalThis)
        global[/** @type {string} */ (prop)] = stored.value
      } catch {
        // ignore
      }
    }
  }
}

export const isolation = new Isolation()
