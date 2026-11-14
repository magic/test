import path from 'node:path'

import { prewarmWorkerModules } from '#src/run/lib/prewarmWorkerModules.js'
import { has } from '#lib/has.js'
import type { TestCase } from '#src/types.js'

const CWD = process.cwd()
const FIXTURES = path.join(CWD, 'src', 'lib', 'svelte', 'testFixtures', 'components')
const BUTTON = path.join(FIXTURES, 'Button.svelte')

export default [
  {
    fn: async () => {
      await prewarmWorkerModules([])
      return true
    },
    expect: true,
    info: 'handles an empty suite without errors',
  },
  {
    fn: async () => {
      // String ref, relative path (resolved against cwd) + [path, props]
      // tuple ref; a component ref nested two levels deep
      await prewarmWorkerModules({
        tests: [
          { component: 'src/lib/svelte/testFixtures/components/Button.svelte', fn: () => 1 },
          { component: [BUTTON, { label: 'x' }], fn: () => 1 },
          {
            nested: { deep: { component: 'src/lib/svelte/testFixtures/components/Button.svelte' } },
          },
        ],
      })
      return true
    },
    expect: true,
    info: 'collects string, tuple, and deeply nested component refs',
  },
  {
    fn: async () => {
      // Absolute path branch of resolveComponentPath
      await prewarmWorkerModules({ component: BUTTON, fn: () => 1 })
      return true
    },
    expect: true,
    info: 'handles absolute component paths',
  },
  {
    fn: async () => {
      // #-prefixed ref → import-map resolution branch
      await prewarmWorkerModules({
        component: '#src/lib/svelte/testFixtures/components/Button.svelte',
        fn: () => 1,
      })
      return true
    },
    expect: true,
    info: 'resolves #-prefixed refs through the import map',
  },
  {
    fn: async () => {
      // Unresolvable/missing components must be swallowed (best-effort)
      await prewarmWorkerModules({
        tests: [
          { component: 'src/lib/svelte/testFixtures/components/DoesNotExist.svelte', fn: () => 1 },
          { component: '#nonexistent/Thing.svelte', fn: () => 1 },
        ],
      })
      return true
    },
    expect: true,
    info: 'missing components are swallowed (best-effort prewarm)',
  },
  {
    fn: async () => {
      // Circular test collection must terminate (seen WeakSet)
      const circular: Record<string, unknown> = { component: BUTTON }
      circular.self = circular
      await prewarmWorkerModules([circular, circular])
      return true
    },
    expect: true,
    info: 'circular test collections terminate',
  },
  {
    fn: async () => {
      // Non-object garbage nodes are ignored
      await prewarmWorkerModules(['string', 42, null, { a: 'b' }])
      return true
    },
    expect: true,
    info: 'ignores non-object nodes without component refs',
  },
] satisfies TestCase[]
