// src/app.d.ts

// Fallback AppInstance when @magic/core is not installed
type FallbackAppInstance = Record<string, unknown>

// Try to declare the module - if @magic/core is installed, types will be picked up
declare module '@magic/core/cluster/runCmd.mjs' {
  export function runCmd(...args: unknown[]): Promise<Record<string, unknown>>
}

// Use fallback type - will be overridden if real module is found
type AppInstance = FallbackAppInstance

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

  var beforeAllMJS: boolean | undefined
  var afterallTS: boolean | undefined
  var beforeallJS: boolean | undefined
  var beforeAllTS: boolean | undefined
  var beforeallTS: boolean | undefined
  var testsBeforeAllTS: unknown
  var testsBeforeallTS: unknown
  var afterAllMJS: boolean | undefined
  var afterAllTS: boolean | undefined
  var afterallJS: boolean | undefined

  interface GlobalThis {
    CHECK_PROPS?: unknown

    modules?: FallbackAppInstance['modules']
    actions?: FallbackAppInstance['actions']
    effects?: FallbackAppInstance['effects']
    lib?: FallbackAppInstance['lib']
    helpers?: FallbackAppInstance['helpers']
    subscriptions?: FallbackAppInstance['subscriptions']

    before?: boolean

    beforeAllMJS?: boolean
    afterallTS?: boolean
    beforeallJS?: boolean
    beforeAllTS?: boolean
    beforeallTS?: boolean
    testsBeforeAllTS?: unknown
    testsBeforeallTS?: unknown
    afterAllMJS?: boolean
    afterAllTS?: boolean
    afterallJS?: boolean

    [key: string]: unknown
  }
}

export {}
