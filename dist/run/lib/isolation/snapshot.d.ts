import type { Snapshot } from '../../../types.ts'
export declare const reviveKeyFromString: (keyStr: string) => string | symbol
/**
 * Improved deepClone: returns primitives, copies common built-ins.
 * Functions are skipped in collections and on data properties — they cannot
 * be transferred to workers.
 */
export declare const deepClone: <T>(value: T, seen?: WeakMap<object, unknown>) => T
/**
 * Whether a globalThis property should be captured into a snapshot.
 * O(1) lookup using Set.has().
 */
export declare const shouldCaptureProperty: (prop: string | symbol) => boolean
/**
 * Build a snapshot: store descriptors, values (deep-cloned), and symbol keys.
 */
export declare const buildSnapshot: () => Snapshot
/**
 * Restore properties from a snapshot to globalThis.
 * Handles symbol keys, accessor properties, and falls back to direct assignment.
 */
export declare const restoreProperties: (snapshot: Snapshot) => void
