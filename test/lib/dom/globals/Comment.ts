import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const c = globalThis.document.createComment('test')
        return is.object(c)
      },
      expect: true,
      info: 'Comment is created via document.createComment',
    },
    {
      fn: () => {
        const c = globalThis.document.createComment('test comment')
        return c.textContent
      },
      expect: 'test comment',
      info: 'Comment has correct textContent',
    },
    {
      fn: () => {
        const c = globalThis.document.createComment('test')
        return c.nodeType
      },
      expect: 8,
      info: 'Comment has correct nodeType',
    },
    {
      fn: () => {
        const c = globalThis.document.createComment('test')
        return c.nodeName
      },
      expect: '#comment',
      info: 'Comment has correct nodeName',
    },
    {
      fn: () => {
        const c = globalThis.document.createComment('')
        return is.str(c.data)
      },
      expect: true,
      info: 'Comment has data property',
    },
  ],
}
