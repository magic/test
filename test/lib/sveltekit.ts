import { withSvelteKitStore } from '#lib/sveltekit.js'
import type { TestCase } from '#src/types.js'

// NOTE: this repo does NOT have @sveltejs/kit installed, so withSvelteKitStore
// exercises the no-op fallback: the kit import fails (cached) and the wrapped
// function runs as-is. The SvelteKit-present path is covered by downstream
// SvelteKit projects (e.g. @artificialmuseum/net hooks.server tests).

export default [
  {
    fn: () => withSvelteKitStore(() => 42),
    expect: 42,
    info: 'no-op: returns sync fn result',
  },
  {
    fn: async () => withSvelteKitStore(async () => 'async'),
    expect: 'async',
    info: 'no-op: returns async fn result',
  },
  {
    fn: async () => {
      let threw = false
      try {
        await withSvelteKitStore(() => {
          throw new Error('boom')
        })
      } catch {
        threw = true
      }
      return threw
    },
    expect: true,
    info: 'no-op: errors propagate',
  },
  {
    fn: async () => {
      // consecutive calls must keep working (failed import is cached, not retried per call)
      const a = (await withSvelteKitStore(() => 'a')) as 'a'
      const b = (await withSvelteKitStore(() => 'b')) as 'b'
      return a + b
    },
    expect: 'ab',
    info: 'no-op: cached across calls',
  },
  {
    fn: async () => {
      // fn receives nothing extra; arguments are untouched
      const arg = { ok: true }
      const res = await withSvelteKitStore(() => arg)
      return res === arg
    },
    expect: true,
    info: 'no-op: identity of returned value preserved',
  },
] satisfies TestCase[]
