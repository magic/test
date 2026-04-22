import { is } from '../src/index.js'

export default [
  {
    fn: async () => {
      const { mount } = await import('../src/index.js')
      const { target, unmount } = await mount(
        './src/lib/svelte/testFixtures/components/FixedButtonImporter.svelte',
      )
      const button = target?.querySelector('button')
      await unmount()
      return !!button
    },
    expect: true,
    info: 'can import from svelte-only package',
  },
]
