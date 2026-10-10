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
        stored.value = deepClone(desc.value)
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
