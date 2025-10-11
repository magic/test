// src/app.d.ts

// Import the functions so we can infer types
import type { runCmd } from '@magic/core/cluster/runCmd.mjs'

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
  var tests: any

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
  expect?: Function | Promise<unknown> | unknown

  /**
   * Alias for `expect`.
   */
  is?: Function | Promise<unknown> | unknown

  /** Number of times to run the test. */
  runs?: number

  /**
   * Nested tests or child suites.
   */
  tests?: Test[] | (Record<string, unknown> & TestsWithHooks)

  /**
   * Hook executed before running the test.
   * Can return a cleanup function.
   */
  before?: (test: Test) => void | Function | Promise<void | Function>

  /**
   * Hook executed after the test finishes.
   */
  after?: () => void | Promise<void>
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
  beforeAll?: () =>
    | void
    | Promise<void | (() => void | Promise<void>)>
  afterAll?: () => void | Promise<void>
  fn?: () => unknown | Promise<unknown>
}

/**
 * Definition of a test suite input.
 */
export interface SuiteInput {
  name?: string
  parent?: string
  pkg?: string
  key?: string
  tests: Test[] | (Record<string, unknown> & TestsWithHooks)
}

/**
 * Global test hooks object with special file-based keys.
 */
export type TestSuites = Record<
  string,
  Test[] | (Record<string, unknown> & TestsWithHooks)
> & {
  '/beforeAll.js'?: (
    tests: Record<string, unknown>
  ) =>
    | void
    | Promise<void | (() => void | Promise<void>)>

  '/afterAll.js'?: (
    tests: Record<string, unknown>
  ) => void | Promise<void>
}

}

export {}
