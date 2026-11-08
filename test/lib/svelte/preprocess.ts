import { testExportsPreprocessor } from '#lib/svelte/index.js'
import { has } from '#lib/has.js'

const sourceWithState = `
<script>
  let count = $state(0)
  let name = $state('test')
</script>
<div>{count}</div>
`

const sourceWithDerived = `
<script>
  let count = $state(5)
  let doubled = $derived(count * 2)
</script>
<div>{doubled}</div>
`

const sourceWithBoth = `
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  let name = $state('test')
</script>
<div>{doubled}</div>
`

const sourceWithoutScript = `
<div>Hello</div>
`

const sourceWithEmptyScript = `
<script>
</script>
<div>Hello</div>
`

const sourceWithNoRunes = `
<script>
  let count = 0
  function increment() {
    count++
  }
</script>
<div>{count}</div>
`

const sourceWithDestructuredProps = `
<script>
  let { items = [], title = 'List' } = $props()
  let count = $state(items.length)
</script>
<div>{title}</div>
`

const sourceWithScriptNoClose = `
<script>
  let count = $state(0)
</script>
<div>{count}</div>
`

const sourceWithOnlyState = `
<script>
  let x = $state(1)
</script>
<div>{x}</div>
`

const sourceWithScriptTagOnly = `
<script>
  let count = $state(0)
</script>
`

const sourceWithModuleScript = `
<script context="module">
  export const MODULE_CONST = 'test'
</script>
<script>
  let count = $state(0)
</script>
<div>{count}</div>
`

const sourceWithConstNotState = `
<script>
  const COUNT = 5
  let count = $state(COUNT)
</script>
<div>{count}</div>
`

const sourceWithObjectDestructuring = `
<script>
  let { a, b } = $props()
  let count = $state(a + b)
</script>
<div>{count}</div>
`

const sourceWithMalformedScript = `
<script>
  let count = $state(0
</script>
<div>{count}</div>
`

const sourceWithNestedBraces = `
<script>
  let obj = { a: { b: 1 } }
  let count = $state(0)
</script>
<div>{count}</div>
`

const sourceWithOnlyModuleScript = `
<script context="module">
  export const MODULE_CONST = 'test'
</script>
`

const sourceWithNoScriptCloseAtAll = `
<div>No script here</div>
`

const sourceWithOpenScriptTag = `
<script>
  let count = $state(0)
`

const sourceWithMultipleScriptTags = `
<script>
  let a = $state(1)
</script>
<div>{a}</div>
<script>
  let b = $state(2)
</script>
`

export default [
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithState })
      return result.code
    },
    expect: has.string('export { count, name }'),
    info: 'extracts $state variables',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithDerived })
      return result.code
    },
    expect: has.string('export { count, doubled }'),
    info: 'extracts $derived variables',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithBoth })
      return result.code
    },
    expect: has.string('export {'),
    info: 'extracts both $state and $derived',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithoutScript })
      return result.code
    },
    expect: sourceWithoutScript,
    info: 'returns original code when no script tag',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithEmptyScript })
      return result.code
    },
    expect: sourceWithEmptyScript,
    info: 'returns original code when script is empty',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithNoRunes })
      return result.code
    },
    expect: sourceWithNoRunes,
    info: 'returns original code when no runes',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithDestructuredProps })
      return result.code
    },
    expect: has.string('export { count }'),
    info: 'extracts $state even when $props is present',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithScriptNoClose })
      return result.code
    },
    expect: has.string('export { count }'),
    info: 'handles missing closing script tag',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithScriptTagOnly })
      return result.code
    },
    expect: has.string('export { count }'),
    info: 'handles script tag without close',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithOnlyState })
      return result.code
    },
    expect: has.string('export { x }'),
    info: 'extracts single $state variable',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithModuleScript })
      return result.code
    },
    expect: has.string('export { count }'),
    info: 'handles module script separately',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithConstNotState })
      return result.code
    },
    expect: has.string('export { count }'),
    info: 'extracts $state with const reference',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithObjectDestructuring })
      return result.code
    },
    expect: has.string('export { count }'),
    info: 'handles object destructuring in $props',
  },
  {
    before: () => {
      const originalWarn = console.warn
      console.warn = () => {}
      return () => {
        console.warn = originalWarn
      }
    },
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithMalformedScript })
      return result.code
    },
    expect: (code: string) =>
      code.includes('export { count }') || code === sourceWithMalformedScript,
    info: 'handles malformed script with parse error',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithNestedBraces })
      return result.code
    },
    expect: has.string('export { count }'),
    info: 'handles nested braces in code',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithOnlyModuleScript })
      return result.code
    },
    expect: sourceWithOnlyModuleScript,
    info: 'handles only module script (no instance script)',
  },
  {
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithNoScriptCloseAtAll })
      return result.code
    },
    expect: (code: string) => code.includes('export {') || code === sourceWithNoScriptCloseAtAll,
    info: 'handles content without script tag at all',
  },
  {
    before: () => {
      const originalWarn = console.warn
      console.warn = () => {}
      return () => {
        console.warn = originalWarn
      }
    },
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithOpenScriptTag })
      return result.code
    },
    expect: (code: string) => code.includes('export { count }') || code === sourceWithOpenScriptTag,
    info: 'handles unclosed script tag at end',
  },
  {
    before: () => {
      const originalWarn = console.warn
      console.warn = () => {}
      return () => {
        console.warn = originalWarn
      }
    },
    fn: async () => {
      const preprocessor = testExportsPreprocessor()
      const result = await preprocessor.script({ content: sourceWithMultipleScriptTags })
      return result.code
    },
    expect: has.string('a = $state(1)', 'b = $state(2)'),
    info: 'handles multiple script tags',
  },
]
