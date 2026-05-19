import { has } from '../../../src/index.js'
import { createFailResult } from '../../../src/run/lib/createFailResult.js'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: () =>
      createFailResult({
        name: 'test name',
        pkg: 'test-pkg',
        parent: 'test-parent',
      }),
    expect: {
      result: undefined,
      msg: '',
      pass: false,
      parent: 'test-parent',
      name: 'test name',
      expect: undefined,
      expString: undefined,
      key: 'test-pkg.test-parent#test name',
      info: '',
      pkg: 'test-pkg',
    },
    info: 'creates fail result with all fields',
  },
  {
    fn: () =>
      createFailResult({
        name: 'test',
        pkg: 'pkg',
        parent: '',
        key: 'custom-key',
      }),
    expect: has.property('key', 'custom-key'),
    info: 'uses provided key over generated',
  },
  {
    fn: () =>
      createFailResult({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        info: 'test info',
      }),
    expect: (r: { info: string }) => r.info === 'test info',
    info: 'uses provided info',
  },
  {
    fn: () =>
      createFailResult({
        name: 'test',
        pkg: 'pkg',
        parent: '',
      }),
    expect: (r: { parent: string }) => r.parent === '',
    info: 'handles empty parent',
  },
] satisfies TestCase[]
