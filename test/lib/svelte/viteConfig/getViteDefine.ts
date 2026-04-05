import { getViteDefine } from '../../../../src/lib/svelte/viteConfig/getViteDefine.js'

export default [
  {
    fn: async () => {
      // getViteDefine is a simple wrapper - test it works
      const result = await getViteDefine('test/file.svelte')
      return typeof result === 'object'
    },
    expect: true,
    info: 'getViteDefine returns an object (calls loadViteDefine)',
  },
]
