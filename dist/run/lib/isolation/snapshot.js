/* ---------------------------------------------------------------------------
 * GlobalThis snapshot/restore primitives.
 *
 * Pure functions (stateless apart from a small symbol-key cache) that build
 * and apply snapshots of the current globalThis. The Isolation facade in
 * src/run/isolation.ts uses these for per-test and per-suite isolation.
 * -------------------------------------------------------------------------- */
import is from '@magic/types'
import log from '@magic/log'
import { skipProps } from './skipProps.js'
/**
 * Map stringified symbol keys back to the Symbol itself.
 * Uses a cache for O(1) repeated lookups.
 */
const symbolCache = new Map()
export const reviveKeyFromString = keyStr => {
  if (!keyStr.startsWith('Symbol(')) {
    return keyStr
  }
  const cached = symbolCache.get(keyStr)
  if (cached) {
    return cached
  }
  // Build cache and find match
  const syms = Object.getOwnPropertySymbols(globalThis)
  for (const s of syms) {
    const symStr = String(s)
    symbolCache.set(symStr, s)
    if (symStr === keyStr) {
      return s
    }
  }
  return keyStr
}
/**
 * Improved deepClone: returns primitives, copies common built-ins.
 * Functions are skipped in collections and on data properties — they cannot
 * be transferred to workers.
 */
export const deepClone = (value, seen = new WeakMap()) => {
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
      const cloned = deepClone(v, seen)
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
      const cloned = deepClone(v, seen)
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
      const clonedK = deepClone(k, seen)
      const clonedV = deepClone(v, seen)
      if (!is.function(clonedK) && !is.function(clonedV)) {
        out.set(clonedK, clonedV)
      }
    }
    return out
  }
  if (is.instance(value, ArrayBuffer)) {
    return value.slice()
  }
  if (ArrayBuffer.isView(value)) {
    // TypedArray - copy via slice, DataView has no slice so skip
    try {
      return value.slice()
    } catch {
      return value
    }
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
    if (!desc) {
      continue
    }
    if (desc.get || desc.set) {
      Object.defineProperty(copy, key, {
        configurable: !!desc.configurable,
        enumerable: !!desc.enumerable,
        get: desc.get,
        set: desc.set,
      })
    } else {
      // Skip function-valued data properties; they cannot be transferred to workers
      if (is.function(desc.value)) {
        continue
      }
      Object.defineProperty(copy, key, {
        configurable: !!desc.configurable,
        enumerable: !!desc.enumerable,
        writable: 'writable' in desc ? !!desc.writable : false,
        value: deepClone(desc.value, seen),
      })
    }
  }
  return copy
}
/**
 * Storage-like detection: localStorage/sessionStorage (happy-dom Storage).
 * These instances cannot be deep-cloned (their data lives in private state
 * behind methods); a JSON clone is a broken shell that restore would
 * install over the real storage.
 */
const isStorageLike = value =>
  is.object(value) &&
  is.function(value.getItem) &&
  is.function(value.setItem) &&
  is.function(value.removeItem) &&
  is.function(value.clear) &&
  'length' in value
const STORAGE_MARKER = '__storage'
/**
 * Capture a storage instance as its entries (restored by re-populating the
 * LIVE instance instead of replacing it).
 */
const captureStorage = storage => {
  const entries = []
  try {
    const s = storage
    const length = Number(s.length) || 0
    for (let i = 0; i < length; i++) {
      const k = s.key(i)
      if (k !== null && k !== undefined) {
        entries.push([k, s.getItem(k) ?? ''])
      }
    }
  } catch {
    // best effort: restore with what we managed to read
  }
  return { [STORAGE_MARKER]: true, entries }
}
/**
 * Restore captured storage entries into the live storage instance.
 */
const restoreStorage = (storage, entries) => {
  try {
    const s = storage
    s.clear()
    for (const [k, v] of entries) {
      s.setItem(k, v)
    }
  } catch {
    // ignore: live storage is not restorable right now
  }
}
/**
 * Whether a globalThis property should be captured into a snapshot.
 * O(1) lookup using Set.has().
 */
export const shouldCaptureProperty = prop => {
  const name = is.symbol(prop) ? String(prop) : prop
  if (skipProps.has(name)) {
    return false
  }
  const desc = Object.getOwnPropertyDescriptor(globalThis, prop)
  if (!desc) {
    return false
  }
  if (desc.configurable === false) {
    return false
  }
  if ('value' in desc && is.function(desc.value)) {
    return false
  }
  if (desc.get || desc.set) {
    return false
  }
  return true
}
/**
 * Build a snapshot: store descriptors, values (deep-cloned), and symbol keys.
 */
export const buildSnapshot = () => {
  const snapshot = { props: {} }
  const allKeys = [
    ...Object.getOwnPropertyNames(globalThis),
    ...Object.getOwnPropertySymbols(globalThis),
  ]
  for (const key of allKeys) {
    if (!shouldCaptureProperty(key)) {
      continue
    }
    const desc = Object.getOwnPropertyDescriptor(globalThis, key)
    if (!desc) {
      continue
    }
    if (desc.configurable === false) {
      continue
    }
    // Skip function-valued data properties (cannot be cloned)
    if ('value' in desc && is.function(desc.value)) {
      continue
    }
    // Skip accessor properties (get/set are functions and cannot be cloned)
    if (desc.get || desc.set) {
      continue
    }
    const stored = {
      configurable: !!desc.configurable,
      enumerable: !!desc.enumerable,
      writable: 'writable' in desc ? !!desc.writable : false,
    }
    if ('value' in desc) {
      try {
        stored.value = isStorageLike(desc.value)
          ? captureStorage(desc.value)
          : deepClone(desc.value)
      } catch (e) {
        log.warn('Isolation: failed to deep clone property value for', String(key), ':', e)
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
 * Restore properties from a snapshot to globalThis.
 * Handles symbol keys, accessor properties, and falls back to direct assignment.
 */
export const restoreProperties = snapshot => {
  const currentNames = [
    ...Object.getOwnPropertyNames(globalThis),
    ...Object.getOwnPropertySymbols(globalThis),
  ]
  const snapshotNames = new Set(Object.keys(snapshot.props))
  // Delete properties not in snapshot
  for (const prop of currentNames) {
    if (!shouldCaptureProperty(prop)) {
      continue
    }
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
  // Restore properties from snapshot
  for (const keyStr in snapshot.props) {
    if (!Object.prototype.hasOwnProperty.call(snapshot.props, keyStr)) {
      continue
    }
    const stored = snapshot.props[keyStr]
    if (!stored) {
      continue
    }
    const prop = reviveKeyFromString(keyStr)
    // Storage instances are synced back into the live instance (see
    // captureStorage); the stored value is a marker, not the storage — it
    // must never be installed as a property.
    if ('value' in stored) {
      const v = stored.value
      if (v && v.__storage === true) {
        const live = globalThis[prop]
        if (isStorageLike(live)) {
          restoreStorage(live, v.entries ?? [])
        }
        continue
      }
    }
    try {
      const desc = {
        configurable: !!stored.configurable,
        enumerable: !!stored.enumerable,
      }
      if ('value' in stored) {
        desc.writable = !!stored.writable
        desc.value = stored.value
      } else {
        if (stored.get) {
          desc.get = stored.get
        }
        if (stored.set) {
          desc.set = stored.set
        }
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
//# sourceMappingURL=snapshot.js.map
