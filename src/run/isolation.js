import is from '@magic/types'

const skipProps = [
  'console',
  'process',
  'Buffer',
  'global',
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
]

/**
 * @typedef {object} PropertyDescriptorRecord
 * @property {boolean} configurable
 * @property {boolean} enumerable
 * @property {boolean} [writable]
 * @property {unknown} [value]
 * @property {(() => any) | undefined} [get]
 * @property {((v: any) => void) | undefined} [set]
 */

/**
 * @typedef {object} Snapshot
 * @property {Record<string, PropertyDescriptorRecord>} props
 */

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
    if (value === null || typeof value !== 'object') {
      return value
    }

    if (seen.has(value)) {
      return /** @type {T} */ (seen.get(value))
    }

    if (is.arr(value)) {
      const copy = []
      for (const v of value) {
        copy.push(this.deepClone(v, seen))
      }

      seen.set(value, copy)
      return /** @type {T} */ (copy)
    }

    if (value instanceof Date) {
      return /** @type {T} */ (new Date(value.getTime()))
    }
    if (value instanceof RegExp) {
      return /** @type {T} */ (new RegExp(value.source, value.flags))
    }

    if (value instanceof Set) {
      const out = new Set()
      seen.set(value, out)
      for (const v of value) {
        out.add(this.deepClone(v, seen))
      }
      return /** @type {T} */ (out)
    }
    if (value instanceof Map) {
      const out = new Map()
      seen.set(value, out)
      for (const [k, v] of value) {
        out.set(this.deepClone(k, seen), this.deepClone(v, seen))
      }
      return /** @type {T} */ (out)
    }

    if (ArrayBuffer.isView(value) || is.instance(value, ArrayBuffer)) {
      return /** @type {any} */ (value).slice(0)
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
        Object.defineProperty(copy, key, {
          configurable: desc.configurable,
          enumerable: desc.enumerable,
          writable: desc.writable,
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
        } catch {
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
    } catch {
      // ignore
    }
  }

  /**
   * @param {string} suiteKey
   * @returns {void}
   */
  restoreSuiteSnapshot(suiteKey) {
    const snapshot = this.suiteSnapshots.get(suiteKey)
    if (!snapshot) return

    /** @type {(string | symbol)[]} */
    const currentNames = /** @type {(string | symbol)[]} */ (
      Object.getOwnPropertyNames(globalThis)
    ).concat(Object.getOwnPropertySymbols(globalThis))
    const snapshotNames = new Set(Object.keys(snapshot.props))

    for (const key of currentNames) {
      if (!this.shouldCaptureProperty(key)) continue
      if (!snapshotNames.has(String(key))) {
        try {
          const desc = Object.getOwnPropertyDescriptor(globalThis, key)
          if (desc && desc.configurable !== false) {
            // @ts-ignore dynamic delete
            delete globalThis[key]
          }
        } catch {
          // ignore
        }
      }
    }

    for (const [keyStr, stored] of Object.entries(snapshot.props)) {
      const key = this._reviveKeyFromString(keyStr)
      try {
        /** @type {PropertyDescriptor} */
        const desc = {}
        desc.configurable = !!stored.configurable
        desc.enumerable = !!stored.enumerable
        if ('value' in stored) {
          desc.writable = !!stored.writable
          desc.value = this.deepClone(stored.value)
        } else {
          desc.get = stored.get
          desc.set = stored.set
        }
        Object.defineProperty(globalThis, key, desc)
      } catch {
        try {
          // @ts-ignore assignment fallback
          globalThis[key] = stored.value
        } catch {
          // ignore
        }
      }
    }

    this.suiteSnapshots.delete(suiteKey)
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
    const snapshot = this.snapshots.get(testKey)
    if (!snapshot) return

    /** @type {(string | symbol)[]} */
    const currentNames = /** @type {(string | symbol)[]} */ (
      Object.getOwnPropertyNames(globalThis)
    ).concat(Object.getOwnPropertySymbols(globalThis))
    const snapshotNames = new Set(Object.keys(snapshot.props))

    for (const key of currentNames) {
      if (!this.shouldCaptureProperty(key)) continue
      if (!snapshotNames.has(String(key))) {
        try {
          const desc = Object.getOwnPropertyDescriptor(globalThis, key)
          if (desc && desc.configurable !== false) {
            // @ts-ignore dynamic delete
            delete globalThis[key]
          }
        } catch {
          // ignore
        }
      }
    }

    for (const [keyStr, stored] of Object.entries(snapshot.props)) {
      const key = this._reviveKeyFromString(keyStr)
      try {
        /** @type {PropertyDescriptor} */
        const desc = {}
        desc.configurable = !!stored.configurable
        desc.enumerable = !!stored.enumerable
        if ('value' in stored) {
          desc.writable = !!stored.writable
          desc.value = this.deepClone(stored.value)
        } else {
          desc.get = stored.get
          desc.set = stored.set
        }
        Object.defineProperty(globalThis, key, desc)
      } catch {
        try {
          // @ts-ignore fallback assignment
          globalThis[key] = stored.value
        } catch {
          // ignore
        }
      }
    }

    this.snapshots.delete(testKey)
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
    const name = typeof prop === 'symbol' ? String(prop) : prop
    if (skipProps.includes(name)) return false

    const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
    if (!desc) return false
    if (desc.configurable === false) return false
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
}

export const isolation = new Isolation()
