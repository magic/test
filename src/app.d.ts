// src/app.d.ts

// Import the functions so we can infer types
import type { runCmd } from '@magic/core/cluster/runCmd.mjs'
import type { CustomError } from '@magic/error'

// AppInstance = the result of `runCmd("prepare", App, config)`
type AppInstance = Awaited<ReturnType<typeof runCmd>>

declare global {
  var CHECK_PROPS: unknown | undefined

  var modules: AppInstance['modules'] | undefined
  var actions: AppInstance['actions'] | undefined
  var effects: AppInstance['effects'] | undefined
  var lib: AppInstance['lib'] | undefined
  var helpers: AppInstance['helpers'] | undefined
  var subscriptions: AppInstance['subscriptions'] | undefined
  var before: boolean | undefined
  var tests: unknown

  // Allow dynamic property access on globalThis
  interface GlobalThis {
    CHECK_PROPS?: unknown

    modules?: AppInstance['modules']
    actions?: AppInstance['actions']
    effects?: AppInstance['effects']
    lib?: AppInstance['lib']
    helpers?: AppInstance['helpers']
    subscriptions?: AppInstance['subscriptions']

    before?: boolean

    [key: string]: unknown
  }

  /* -------------------------------------------------------------
   * Test framework type definitions (converted from JSDoc)
   * ----------------------------------------------------------- */

  /**
   * Definition of a single test (input before execution).
   */
  export interface Test {
    /** The test name. */
    name: string

    /** The package this test belongs to. */
    pkg: string

    /** The parent suite/group name. */
    parent: string

    /** Additional information about the test. */
    info?: string

    /** A unique identifier for the test. */
    key?: string

    /**
     * The test function, a promise, or a direct value to evaluate.
     */
    fn?:
      | Function
      | Promise<unknown>
      | string
      | boolean
      | number
      | Record<string, unknown>
      | unknown[]

    /**
     * The expected value, or a function/promise that produces it.
     */
    expect?: ((...args: unknown[]) => unknown) | Promise<unknown> | unknown

    /**
     * Alias for `expect`.
     */
    is?: ((...args: unknown[]) => unknown) | Promise<unknown> | unknown

    /** Number of times to run the test. */
    runs?: number

    /** Timeout in milliseconds for the test */
    timeout?: number

    /**
     * Nested tests or child suites.
     */
    tests?: TestCollection

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
     * Component to mount for Svelte component tests.
     * Can be a string path or [path, props] tuple.
     */
    component?: string | [string, Record<string, unknown>?]

    /**
     * Props to pass to the component (alternative to passing in component tuple).
     */
    props?: Record<string, unknown>
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

    /** Stringified expectation. */
    expString: string | unknown

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
  }

  /**
   * State interface for store
   */
  export interface State {
    suites: Record<string, unknown>
    stats: Stats
    pkg: string
    startTime?: [number, number]
    results?: TestResults
    [key: string]: unknown
  }

  /**
   * Global test hooks object with special file-based keys.
   */
  export type TestSuites = Record<string, TestCollection> & {
    '/beforeAll.js'?: (tests: TestSuites) => void | Promise<void | CleanupFunction>

    '/afterAll.js'?: (tests: TestSuites) => void | Promise<void>
  }

  /* -------------------------------------------------------------
   * Shared type definitions for test framework
   * ----------------------------------------------------------- */

  /**
   * A single test function with its metadata.
   */
  export interface TestItem {
    name: string
    fn: () => Promise<void>
    before?: TestBeforeHook
    after?: TestAfterHook
  }

  /**
   * A test suite containing multiple test items.
   */
  export interface TestSuite {
    name: string
    tests: TestItem[]
    hooks: TestHooks
  }

  export type JsonSafe = string | number | boolean | null | undefined | object

  export type JsonSafeArg = JsonSafe | (() => unknown)

  /*
   * All acceptable input types to `stringify`, including functions and nested structures.
   */
  export type InputValue = JsonSafeArg | JsonSafeArg[]

  /*
   * @magic/error CustomError Object
   */
  export type CustomError = MagicCustomError

  export type TestObject = Record<string, unknown> & TestsWithHooks

  /**
   * A collection of tests, either an array or an object with hooks.
   */
  export type TestCollection = Test[] | TestObject

  /**
   * Simple cleanup function returned by before hooks.
   */
  export type CleanupFunction = () => void | Promise<void>

  /**
   * Suite-level hook (beforeAll/afterAll/beforeEach/afterEach).
   * No params. beforeAll can return cleanup function.
   */
  export type SuiteHook = () => void | Promise<void | CleanupFunction>

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
    test?: Test | TestItem,
  ) => void | CleanupFunction | Promise<void | CleanupFunction>

  /**
   * Test-level after hook.
   * No params, no cleanup.
   */
  export type TestAfterHook = () => void | Promise<void>

  /**
   * A partial test definition for internal use.
   */
  export interface PartialTest {
    name: string
    pkg?: string
    parent?: string
    pass: boolean
  }

  /**
   * A module's exported values.
   */
  export type ModuleExport = Record<string, unknown>

  /**
   * Props passed to a component.
   */
  export type ComponentProps = Record<string, unknown>

  /* -------------------------------------------------------------
   * Shared type definitions for test framework
   * ----------------------------------------------------------- */

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

  /**
   * Store class interface for test state management.
   */
  export interface IStore {
    state: State
    set(val: Partial<State>): void
    get<K extends keyof State>(key: K, def?: State[K]): State[K] | undefined
    get(key: string, def?: unknown): unknown
    reset(): void
  }
}

export {
  Test,
  TestResult,
  Suite,
  TestsWithHooks,
  TestHooks,
  SuiteInput,
  TestSuites,
  TestItem,
  TestSuite,
  TestCollection,
  ModuleExport,
  ComponentProps,
  Stats,
  TestStats,
  TestResults,
  CleanupFunction,
  SuiteHook,
  SuiteHookWithArg,
  TestBeforeHook,
  TestAfterHook,
  PartialTest,
  State,
  EvaluateResult,
  PropertyDescriptorRecord,
  Snapshot,
  CleanupResult,
  IStore,
}

export {}
