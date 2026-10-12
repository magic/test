import type { Store } from '../lib/store.js'
import { BEFORE_ALL_KEYS, AFTER_ALL_KEYS } from '../lib/hookFiles.js'
type BeforeAllKey = (typeof BEFORE_ALL_KEYS)[number]
type AfterAllKey = (typeof AFTER_ALL_KEYS)[number]
export type TestContext = {
  target: HTMLElement
  component: Record<string, unknown>
  unmount: () => Promise<void>
  css: {
    code: string
    map?: unknown
    hasGlobal?: boolean
  } | null
}
type FnReturnType<F> = F extends () => Promise<infer R>
  ? R
  : F extends () => infer R
    ? R
    : F extends (arg: TestContext) => Promise<infer R>
      ? R
      : F extends (arg: TestContext) => infer R
        ? R
        : unknown
export type TestExpect<T = unknown> =
  ((result: T) => boolean | Promise<boolean>) | T | (TestExpect<T> | T)[]
/**
 * Info passed to a context factory function: the mount target and processed props.
 */
export type ContextInfo = {
  target: HTMLElement
  props: Record<string, unknown>
}
/**
 * Svelte context option: static entries (string or symbol keys), or a factory
 * function receiving the mount target and props.
 */
export type ContextOption =
  Record<PropertyKey, unknown> | ((info: ContextInfo) => Record<PropertyKey, unknown>)
export interface Test {
  /** Additional information about the test. */
  info?: string
  /** A unique identifier for the test. */
  key?: string
  /**
   * The test function, a promise, or a direct value to evaluate.
   * When using component mount, fn receives { target, component, unmount, css }
   */
  fn?:
    | ((arg: TestContext) => unknown)
    | Promise<unknown>
    | string
    | boolean
    | number
    | Record<string, unknown>
    | unknown[]
  /**
   * The expected value, or a function/promise that produces it.
   */
  expect?: TestExpect<FnReturnType<Test['fn']>> | FnReturnType<Test['fn']>
  /**
   * Alias for `expect`.
   */
  is?: TestExpect<FnReturnType<Test['fn']>> | FnReturnType<Test['fn']>
  /** Number of times to run the test. */
  runs?: number
  /** Timeout in milliseconds for the test */
  timeout?: number
  /**
   * Hook executed before running the test.
   * Can return a cleanup function.
   */
  before?: TestBeforeHook
  /**
   * Hook executed after the test finishes.
   */
  after?: TestAfterHook
  /**
   * Hook executed before each test run (for isolation).
   */
  beforeEach?: CleanupFunction
  /**
   * Hook executed after each test run (for cleanup).
   */
  afterEach?: CleanupFunction
  /**
   * Component to mount for Svelte component tests.
   * Can be a string path or [path, props] tuple.
   */
  component?: string | [string, Record<string, unknown>?]
  /**
   * Props to pass to the component (alternative to passing in component tuple).
   */
  props?: Record<string, unknown>
  /**
   * Svelte context to provide to the mounted component (setContext semantics).
   * Maps context keys (string or symbol) to values; entries are set in an
   * invisible wrapper component around the mounted component, so the mounted
   * component (and its descendants) can read them via getContext.
   * Pass values - e.g. for svelte-maplibre:
   * `context: { [Symbol.for('svelte-maplibre')]: new MapContext() }`
   * (not `createMapContext()`, which itself calls setContext).
   * Alternatively pass a function receiving `{ target, props }` and returning
   * the entries - useful when a context value needs a reference to the DOM the
   * component renders into (e.g. a stub map whose canvas container is the
   * mount target).
   */
  context?: ContextOption
  /**
   * Nested tests or child suites.
   */
  tests?: TestCollection
  /** The test name. */
  name?: string
  /** The package this test belongs to. */
  pkg?: string
  /** The parent suite/group name. */
  parent?: string
}
/**
 * Definition of a single test (input before execution but after processing additional fields).
 */
export interface WrappedTest extends Test {
  /** The test name. */
  name: string
  /** The package this test belongs to. */
  pkg: string
  /** The parent suite/group name. */
  parent: string
}
/**
 * Result of a single test execution.
 */
export interface TestResult {
  /** The actual output of the test. */
  result: unknown
  /** Cleaned stringified version of the test function. */
  msg: string
  /** Whether the test passed. */
  pass: boolean
  /** The parent suite/group name. */
  parent: string
  /** The test name. */
  name: string
  /** The expected value (evaluated). */
  expect: unknown
  /** Stringified expectation (or raw value if not a function). */
  expString: unknown
  /** Unique test key. */
  key: string
  /** package.json name field. */
  pkg?: string
  /** Extra metadata or documentation. */
  info?: string
  /** Error from afterCleanup hook (if any) */
  afterCleanupError?: unknown
  /** Error from after hook (if any) */
  afterError?: unknown
}
/**
 * Represents a suite or group of tests.
 */
export interface Suite {
  /** Number of passing tests. */
  pass: number
  /** Number of failing tests. */
  fail: number
  /** Total number of tests run. */
  all: number
  /** Suite name. */
  name: string
  /** Parent suite name. */
  parent: string
  /** Package name. */
  pkg: string
  /** Child test results or nested suites. */
  tests: Array<TestResult | Suite>
  /** Execution duration. */
  duration?: string
  /** Unique suite key. */
  key?: string
}
/**
 * Optional setup and teardown hooks for test collections.
 */
export interface TestsWithHooks {
  beforeAll?: SuiteHook
  afterAll?: CleanupFunction
  fn?: () => unknown | Promise<unknown>
}
/**
 * Simplified hooks interface for internal use.
 */
export interface TestHooks {
  beforeAll?: CleanupFunction
  afterAll?: CleanupFunction
  beforeEach?: CleanupFunction
  afterEach?: CleanupFunction
}
/**
 * Definition of a test suite input.
 */
export interface SuiteInput {
  name?: string
  parent?: string
  pkg?: string
  key?: string
  tests: TestCollection
  store?: Store
  rawResults?: TestResult[]
}
/**
 * State interface for store
 */
export interface State {
  suites: Record<string, unknown>
  stats: Stats
  pkg: string
  startTime?: [number, number]
  globalStartTime?: [number, number]
  results?: TestResults
}
/**
 * Global test hooks object with special file-based keys.
 * Hook keys are derived from the canonical lists in lib/hookFiles.ts.
 */
export type TestSuites = Record<string, TestCollection> & {
  [K in BeforeAllKey]?: (tests: TestSuites) => void | Promise<void | CleanupFunction>
} & {
  [K in AfterAllKey]?: (tests: TestSuites) => void | Promise<void>
}
/**
 * A single test function with its metadata.
 */
export interface TestItem {
  name: string
  fn: () => Promise<void>
  before?: TestBeforeHook
  after?: TestAfterHook
}
export type JsonSafe = string | number | boolean | null | undefined | object
export type JsonSafeArg = JsonSafe | (() => unknown)
export type InputValue = JsonSafeArg | JsonSafeArg[]
export interface TestObject {
  beforeAll?: SuiteHook
  afterAll?: CleanupFunction
  fn?: () => unknown | Promise<unknown>
  tests?: TestCollection
  [key: string]: unknown
}
/**
 * A collection of tests, either an array or an object with hooks.
 */
export interface TestCollectionObject {
  beforeAll?: SuiteHook
  afterAll?: CleanupFunction
  fn?: () => unknown | Promise<unknown>
  tests?: TestCollection
  nested?: TestCollection
  [key: string]: unknown
}
export type TestCollection = Test[] | TestCollectionObject
/**
 * Simple cleanup function returned by before hooks.
 */
export type CleanupFunction = () => unknown | Promise<unknown>
/**
 * Suite-level hook (beforeAll/afterAll/beforeEach/afterEach).
 * No params. beforeAll can return cleanup function.
 */
export type SuiteHook = () => unknown | Promise<unknown | CleanupFunction>
/**
 * Suite-level hook that accepts optional test suites parameter.
 * Used when running in test runner context.
 */
export type SuiteHookWithArg = (tests?: unknown) => void | Promise<void | CleanupFunction>
/**
 * Test-level before hook.
 * Takes test parameter, can return cleanup function.
 */
export type TestBeforeHook = (
  test?: WrappedTest | TestItem,
) => void | CleanupFunction | Promise<void | CleanupFunction>
/**
 * Test-level after hook.
 * No params, no cleanup.
 */
export type TestAfterHook = () => void | Promise<void>
/**
 * Props passed to a component.
 */
export type ComponentProps = Record<string, unknown>
/**
 * Test execution statistics.
 */
export interface Stats {
  /** Total number of tests */
  all: number
  /** Number of passing tests */
  pass: number
  /** Number of failing tests */
  fail: number
}
/**
 * Test results by test key.
 * Uses interface with index signature for proper typing.
 */
export interface TestResults {
  [key: string]: TestStats
}
/**
 * Statistics for a single test.
 */
export interface TestStats {
  /** Total number of tests */
  all: number
  /** Number of passing tests */
  pass: number
}
/**
 * Result of evaluating a test against its expected value.
 */
export interface EvaluateResult {
  pass: boolean
  exp: unknown
  expString: unknown
}
/**
 * Property descriptor for globalThis snapshot/restore.
 */
export interface PropertyDescriptorRecord {
  configurable: boolean
  enumerable: boolean
  writable?: boolean
  value?: unknown
  get?: () => unknown
  set?: (v: unknown) => void
}
/**
 * Snapshot of globalThis state for isolation.
 */
export interface Snapshot {
  props: Record<string, PropertyDescriptorRecord>
}
/**
 * Result of running suite hooks.
 */
export interface CleanupResult {
  beforeAllCleanup?: CleanupFunction
  afterAllCleanup?: CleanupFunction
}
export type AliasEntry = {
  find: string | RegExp
  replacement: string
}
export type ViteConfig = {
  resolve?: {
    alias: AliasEntry[]
  }
  define?: Record<string, unknown>
}
type UnwrapResult<T> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : T
interface BaseTestCase {
  name?: string
  info?: string
  runs?: number
  timeout?: number
  before?: TestBeforeHook
  after?: TestAfterHook
}
type ExpectFn<R> = (result: R) => R | boolean | Promise<R | boolean>
export type TestCase =
  | (BaseTestCase & {
      fn: (ctx: TestContext) => unknown
      component?: string | [string, Record<string, unknown>]
      props?: Record<string, unknown>
      expect?: ExpectFn<unknown> | unknown
    })
  | (BaseTestCase & {
      fn: () => unknown
      expect?: ExpectFn<UnwrapResult<() => unknown>> | UnwrapResult<() => unknown>
      component?: string | [string, Record<string, unknown>]
      props?: Record<string, unknown>
    })
  | (BaseTestCase & {
      fn?: unknown
      component?: string | [string, Record<string, unknown>]
      props?: Record<string, unknown>
    })
export {}
