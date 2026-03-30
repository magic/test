/**
 * @typedef {object} PropertyDescriptorRecord
 * @property {boolean} configurable
 * @property {boolean} enumerable
 * @property {boolean} [writable]
 * @property {unknown} [value]
 * @property {(() => unknown) | undefined} [get]
 * @property {((v: unknown) => void) | undefined} [set]
 */
/**
 * @typedef {object} Snapshot
 * @property {Record<string, PropertyDescriptorRecord>} props
 */
export class Isolation {
  /** @type {Map<string, Snapshot>} */
  snapshots: Map<string, Snapshot>
  /** @type {Map<string, Snapshot>} */
  suiteSnapshots: Map<string, Snapshot>
  /**
   * Improved deepClone: returns primitives, copies common built-ins.
   * @template T
   * @param {T} value
   * @param {WeakMap<object, unknown>} [seen]
   * @returns {T}
   */
  deepClone<T>(value: T, seen?: WeakMap<object, unknown>): T
  /**
   * Build a snapshot: store descriptors, values (deep-cloned), and symbol keys
   * @returns {Snapshot}
   */
  buildSnapshot(): Snapshot
  /**
   * @param {string} suiteKey
   * @returns {void}
   */
  captureSuiteSnapshot(suiteKey: string): void
  /**
   * @param {string} suiteKey
   * @returns {void}
   */
  restoreSuiteSnapshot(suiteKey: string): void
  /**
   * @param {Map<string, Snapshot>} snapshotMap
   * @param {string} key
   * @returns {void}
   */
  restoreSnapshotFromMap(snapshotMap: Map<string, Snapshot>, key: string): void
  /**
   * @param {string} testKey
   * @returns {void}
   */
  captureSnapshot(testKey: string): void
  /**
   * @param {string} testKey
   * @returns {void}
   */
  restoreSnapshot(testKey: string): void
  /**
   * helper to map stringified symbol keys back to Symbol if needed
   * @param {string} keyStr
   * @returns {string | symbol}
   */
  _reviveKeyFromString(keyStr: string): string | symbol
  /**
   * shouldCaptureProperty unchanged but include symbol type check
   * @param {string | symbol} prop
   * @returns {boolean}
   */
  shouldCaptureProperty(prop: string | symbol): boolean
  /**
   * @template T
   * @param {string} suiteKey
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
  executeSuiteIsolated<T>(suiteKey: string, fn: () => Promise<T>): Promise<T>
  /**
   * @template T
   * @param {string} testKey
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
  executeIsolated<T>(testKey: string, fn: () => Promise<T>): Promise<T>
  /**
   * Run a test in a worker thread for true isolation
   * @param {object} options
   * @param {string} options.testFileUrl
   * @param {number} options.testIndex
   * @param {string} options.testPkg
   * @param {string} options.testParent
   * @param {string} options.testName
   * @param {Snapshot} [options.suiteSnapshot]
   * @returns {Promise<import('../app.d.ts').TestResult>}
   */
  executeInWorker({
    testFileUrl,
    testIndex,
    testPkg,
    testParent,
    testName,
    suiteSnapshot,
  }: {
    testFileUrl: string
    testIndex: number
    testPkg: string
    testParent: string
    testName: string
    suiteSnapshot?: Snapshot | undefined
  }): Promise<import('../app.d.ts').TestResult>
}
export function restoreFromSnapshot(snapshot: Snapshot): void
export const isolation: Isolation
export type PropertyDescriptorRecord = {
  configurable: boolean
  enumerable: boolean
  writable?: boolean | undefined
  value?: unknown
  get?: (() => unknown) | undefined
  set?: ((v: unknown) => void) | undefined
}
export type Snapshot = {
  props: Record<string, PropertyDescriptorRecord>
}
//# sourceMappingURL=isolation.d.ts.map
