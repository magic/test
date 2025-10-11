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
}

export {}