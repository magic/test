import is from '@magic/types'
import { decodeHtmlEntities, createRenderString } from '../../../src/bin/lib/htmlRendering.js'

export default [
  {
    fn: () => is.fn(decodeHtmlEntities),
    expect: true,
    info: 'decodeHtmlEntities is exported and is a function',
  },
  {
    fn: () => {
      return decodeHtmlEntities('&lt;b&gt;hello&lt;/b&gt;') === '<b>hello</b>'
    },
    expect: true,
    info: 'decodes &lt; and &gt; entities',
  },
  {
    fn: () => {
      return decodeHtmlEntities('&quot;quoted&quot;') === '"quoted"'
    },
    expect: true,
    info: 'decodes &quot; entity',
  },
  {
    fn: () => {
      return decodeHtmlEntities('no entities here') === 'no entities here'
    },
    expect: true,
    info: 'passthrough when no entities present',
  },
  {
    fn: () => {
      return decodeHtmlEntities('') === ''
    },
    expect: true,
    info: 'handles empty string',
  },
  {
    fn: () => {
      return decodeHtmlEntities('&lt;a&gt; &amp; &lt;b&gt;') === '<a> &amp; <b>'
    },
    expect: true,
    info: 'only decodes the 3 targeted entities (&lt; &gt; &quot;), leaves others',
  },
  {
    fn: () => {
      const rendered = decodeHtmlEntities('<div class="test">&lt;hello&gt; &quot;world&quot;</div>')
      return rendered === '<div class="test"><hello> "world"</div>'
    },
    expect: true,
    info: 'handles mixed HTML with entities',
  },
  {
    fn: () => {
      return is.fn(createRenderString)
    },
    expect: true,
    info: 'createRenderString is exported',
  },
  {
    fn: () => {
      const renderToString = (view: unknown) => `<div>&lt;${view}&gt;</div>`
      const renderString = createRenderString(renderToString)
      const render = renderString((x: unknown) => String(x))
      return render('hello') === '<div><hello></div>'
    },
    expect: true,
    info: 'renderString wrapper decodes entities from render output',
  },
  {
    fn: () => {
      const renderToString = (_view: unknown) => `<div>&quot;quoted&quot;</div>`
      const renderString = createRenderString(renderToString)
      const render = renderString((x: unknown) => String(x))
      return render('test') === '<div>"quoted"</div>'
    },
    expect: true,
    info: 'renderString decodes &quot; entities',
  },
  // Branch coverage for createRenderString - View property branch (line 33-34)
  {
    fn: () => {
      const renderToString = (view: unknown) => `<div>&lt;${view}&gt;</div>`
      const renderString = createRenderString(renderToString)
      const fn = {
        View: (x: unknown) => String(x),
        toString: () => '',
      }
      const render = renderString(fn as unknown as (...a: unknown[]) => unknown)
      return render('hello') === '<div><hello></div>'
    },
    expect: true,
    info: 'createRenderString uses View property when present (line 33 branch)',
  },
]
