import type { Test } from '#src/index.js'
import { resolve } from '#src/bin/lib/tsLoader.js'

export default [
  {
    fn: async () => {
      // Test that virtual: scheme imports are handled
      // This simulates what paraglide-js does: virtual:paraglide/<hash>/messages/_index.js
      const result = await resolve(
        'virtual:paraglide/6e4779b4af2ddf9d/messages/_index.js',
        { parentURL: 'file:///test/parent.ts' },
        async () => ({ url: 'fallback' }),
      )
      // Should short-circuit and return the empty module
      return result.shortCircuit === true && result.url.includes('empty-module.js')
    },
    expect: true,
    info: 'virtual: scheme imports are intercepted and resolved to empty module',
  },
  {
    fn: async () => {
      // Test that regular imports still go to nextResolve
      const result = await resolve(
        './some-relative.ts',
        { parentURL: 'file:///test/parent.ts' },
        async specifier => ({ url: `resolved:${specifier}` }),
      )
      // Should not short-circuit, should pass to nextResolve
      return result.shortCircuit === undefined && result.url === 'resolved:./some-relative.ts'
    },
    expect: true,
    info: 'regular imports still pass through to nextResolve',
  },
] satisfies Test[]
