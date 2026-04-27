import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new File([], 'test.txt'),
      expect: (t: File) => is.instance(t, File),
      info: 'File is callable with new',
    },
    {
      fn: () => new File([], 'test.txt').size,
      expect: is.num,
      info: 'File size is a number',
    },
    {
      fn: () => new File([new Blob(['testing'])], 'test.txt').size,
      expect: 7,
      info: 'File size reflects blob content',
    },
    {
      fn: () => new File([], 'test.txt').name,
      expect: 'test.txt',
      info: 'File has correct name',
    },
    {
      fn: () => {
        const f = new File([], 'test.txt')
        return f.type
      },
      expect: '',
      info: 'File type is empty string by default',
    },
  ],
}
