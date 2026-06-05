import { mount } from '../src/svelte.js'

export default [
  {
    fn: async () => {
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
