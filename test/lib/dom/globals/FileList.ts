import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const input = globalThis.document.createElement('input')
        input.type = 'file'
        return input.files
      },
      expect: is.object,
      info: 'input.files is a FileList',
    },
    {
      fn: () => {
        const input = globalThis.document.createElement('input')
        input.type = 'file'
        return input.files?.length
      },
      expect: 0,
      info: 'Empty FileList has length 0',
    },
    {
      fn: () => {
        const input = globalThis.document.createElement('input')
        input.type = 'file'
        return input.files?.item
      },
      expect: is.fn,
      info: 'FileList has item method',
    },
    {
      fn: () => {
        const input = globalThis.document.createElement('input')
        input.type = 'file'
        const item = input.files?.[0]
        return item === null || item === undefined
      },
      expect: true,
      info: 'FileList indexed access returns null or undefined for empty',
    },
    {
      fn: () => {
        const input = globalThis.document.createElement('input')
        input.type = 'file'
        return is.fn(input.files?.item)
      },
      expect: true,
      info: 'FileList.item is a function',
    },
  ],
}
