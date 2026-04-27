import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new DOMParser(),
      expect: is.object,
      info: 'DOMParser is callable with new',
    },
    {
      fn: () => {
        const dp = new DOMParser()
        return dp.parseFromString
      },
      expect: is.fn,
      info: 'DOMParser has parseFromString method',
    },
    {
      fn: () => {
        const dp = new DOMParser()
        const doc = dp.parseFromString('<html><body>test</body></html>', 'text/html')
        return doc.body.textContent
      },
      expect: 'test',
      info: 'DOMParser.parseFromString works',
    },
    {
      fn: () => {
        const dp = new DOMParser()
        const doc = dp.parseFromString('<root/>', 'application/xml')
        return doc.documentElement.tagName
      },
      expect: 'root',
      info: 'DOMParser.parseFromString returns Document',
    },
    {
      fn: () => {
        const dp = new DOMParser()
        const doc = dp.parseFromString('<invalid', 'text/xml')
        return doc.documentElement !== null && doc.documentElement.tagName.length > 0
      },
      expect: true,
      info: 'DOMParser returns document even for invalid XML',
    },
  ],
}
