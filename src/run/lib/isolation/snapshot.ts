/* ---------------------------------------------------------------------------
 * GlobalThis snapshot/restore primitives.
 *
 * Pure functions (stateless apart from a small symbol-key cache) that build
 * and apply snapshots of the current globalThis. The Isolation facade in
 * src/run/isolation.ts uses these for per-test and per-suite isolation.
 * -------------------------------------------------------------------------- */

import is from '@magic/types'
import log from '@magic/log'

import { skipProps } from './skipProps.ts'

import type { Snapshot, PropertyDescriptorRecord } from '../../../types.ts'

/**
 * Map stringified symbol keys back to the Symbol itself.
 * Uses a cache for O(1) repeated lookups.
 */
const symbolCache = new Map<string, symbol>()

export const reviveKeyFromString = (keyStr: string): string | symbol => {
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
export const deepClone = <T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T => {
  if (value === null || !is.object(value)) {
    return value
  }

  if (seen.has(value as object)) {
    return seen.get(value as object) as T
  }

  if (is.arr(value)) {
    const copy: unknown[] = []
    seen.set(value as object, copy)
    for (const v of value) {
      const cloned = deepClone(v, seen)
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
    seen.set(value as object, out)
    for (const v of value) {
      const cloned = deepClone(v, seen)
      if (!is.function(cloned)) {
        out.add(cloned)
      }
    }
    return out as T
  }
  if (is.map(value)) {
    const out = new Map()
    seen.set(value as object, out)
    for (const [k, v] of value) {
      const clonedK = deepClone(k, seen)
      const clonedV = deepClone(v, seen)
      if (!is.function(clonedK) && !is.function(clonedV)) {
        out.set(clonedK, clonedV)
      }
    }
    return out as T
  }

  if (is.instance(value, ArrayBuffer)) {
    return value.slice() as T
  }

  if (ArrayBuffer.isView(value)) {
    // TypedArray - copy via slice, DataView has no slice so skip
    try {
      return (value as unknown as { slice(): unknown }).slice() as T
    } catch {
      return value as T
    }
  }

  if (is.error(value)) {
    return value as T
  }
  if (is.function(value)) {
    return value as T
  }

  const proto = Object.getPrototypeOf(value)
  const copy = Object.create(proto) as Record<string, unknown>
  seen.set(value as object, copy)

  const allKeys = [
    ...Object.getOwnPropertyNames(value),
    ...Object.getOwnPropertySymbols(value),
  ] as (string | symbol)[]

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

  return copy as T
}

/**
 * Whether a globalThis property should be captured into a snapshot.
 * O(1) lookup using Set.has().
 */
export const shouldCaptureProperty = (prop: string | symbol): boolean => {
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
export const buildSnapshot = (): Snapshot => {
  const snapshot: Snapshot = { props: {} }

  const allKeys = [
    ...Object.getOwnPropertyNames(globalThis),
    ...Object.getOwnPropertySymbols(globalThis),
  ] as (string | symbol)[]

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

    const stored: PropertyDescriptorRecord = {
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
export const restoreProperties = (snapshot: Snapshot): void => {
  const currentNames = [
    ...Object.getOwnPropertyNames(globalThis),
    ...Object.getOwnPropertySymbols(globalThis),
  ] as (string | symbol)[]
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
          delete globalThis[prop as keyof typeof globalThis]
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
      const desc: PropertyDescriptor = {
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
