import { has } from '#src/index.js'
import { createFailResult } from '#src/run/lib/createFailResult.js'
import is from '@magic/types'
import type { TestCase } from '#src/types.js'

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
  // Branch: error parameter creates error field
  {
    fn: () => {
      const result = createFailResult({ name: 'test', pkg: 'pkg', parent: '' }, new Error('boom'))
      return is.array(result.error) && result.error.length >= 1
    },
    expect: true,
    info: 'attach cleaned error array when Error object provided',
  },
  {
    fn: () => {
      const result = createFailResult({ name: 'test', pkg: 'pkg', parent: '' }, 'string error')
      return is.array(result.error)
    },
    expect: true,
    info: 'non-Error values wrap to Error then clean to array',
  },
  {
    fn: () => {
      const result = createFailResult({ name: 'test', pkg: 'pkg', parent: '' }, undefined)
      return 'error' in result === false
    },
    expect: true,
    info: 'error field not added when undefined passed',
  },
  {
    fn: () => {
      const result = createFailResult({ name: 'test', pkg: 'pkg', parent: '' }, 42)
      const err = result.error as unknown[]
      return is.array(err) && String(err[0] || '').includes('Error:')
    },
    expect: true,
    info: 'primitives get wrapped and cleaned to array',
  },
] satisfies TestCase[]
