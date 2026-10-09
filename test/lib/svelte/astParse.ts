import {
  extractImportsSync,
  hasSvelteRunes,
  isSvelteCompiled,
  getSvelteReexports,
  hasSvelteReexports,
  getExportStarTargets,
  hasExportStar,
  getExportNamedTargets,
  clearAstCache,
} from '#lib/svelte/compile/astParse.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // --- extractImportsSync ---
  {
    fn: () => {
      const imports = extractImportsSync('import { foo, bar } from "pkg";')
      return (
        imports.length === 1 &&
        imports[0]!.source === 'pkg' &&
        imports[0]!.localNames.includes('foo') &&
        imports[0]!.localNames.includes('bar')
      )
    },
    expect: true,
    info: 'extractImportsSync extracts named imports with localNames',
  },
  {
    fn: () => {
      const imports = extractImportsSync('import def from "pkg";')
      return imports.length === 1 && imports[0]!.localNames.includes('def')
    },
    expect: true,
    info: 'extractImportsSync extracts default import',
  },
  {
    fn: () => {
      const imports = extractImportsSync('import * as ns from "pkg";')
      return imports.length === 1 && imports[0]!.localNames.includes('ns')
    },
    expect: true,
    info: 'extractImportsSync extracts namespace import',
  },
  {
    fn: () => {
      const imports = extractImportsSync('import "side-effect";')
      return imports.length === 1 && imports[0]!.localNames.length === 0
    },
    expect: true,
    info: 'extractImportsSync handles side-effect imports',
  },
  {
    fn: () => {
      const imports = extractImportsSync('const x = 1;')
      return imports.length === 0
    },
    expect: true,
    info: 'extractImportsSync returns empty for no imports',
  },
  {
    fn: () => {
      const imports = extractImportsSync('import a from "a";\nimport { b } from "b";')
      return imports.length === 2 && imports[0]!.source === 'a' && imports[1]!.source === 'b'
    },
    expect: true,
    info: 'extractImportsSync handles multiple imports',
  },
  {
    fn: () => {
      const imports = extractImportsSync('this is not valid code !!!')
      return Array.isArray(imports) && imports.length === 0
    },
    expect: true,
    info: 'extractImportsSync returns empty array on parse error',
  },
  {
    fn: () => {
      const code = 'import x from "pkg";'
      const imports = extractImportsSync(code)
      return (
        imports[0]!.start >= 0 &&
        imports[0]!.end <= code.length &&
        imports[0]!.originalText.includes('import')
      )
    },
    expect: true,
    info: 'extractImportsSync provides correct range and originalText',
  },

  // --- hasSvelteRunes ---
  {
    fn: () => hasSvelteRunes('const count = $state(0)'),
    expect: true,
    info: 'hasSvelteRunes detects $state',
  },
  {
    fn: () => hasSvelteRunes('const d = $derived(count)'),
    expect: true,
    info: 'hasSvelteRunes detects $derived',
  },
  {
    fn: () => hasSvelteRunes('$effect(() => {})'),
    expect: true,
    info: 'hasSvelteRunes detects $effect',
  },
  {
    fn: () => hasSvelteRunes('let { x } = $props()'),
    expect: true,
    info: 'hasSvelteRunes detects $props',
  },
  {
    fn: () => hasSvelteRunes('const count = 0;'),
    expect: false,
    info: 'hasSvelteRunes false for plain code',
  },
  {
    fn: () => hasSvelteRunes('const $state = 1;'),
    expect: false,
    info: 'hasSvelteRunes false for identifier named $state',
  },

  // --- isSvelteCompiled ---
  {
    fn: () => isSvelteCompiled("import * as $ from 'svelte/internal/';\nconst x = 1"),
    expect: true,
    info: 'isSvelteCompiled detects svelte/internal import',
  },
  {
    fn: () => isSvelteCompiled("import * as $ from 'svelte/internal'"),
    expect: true,
    info: 'isSvelteCompiled detects svelte/internal (no slash)',
  },
  {
    fn: () => isSvelteCompiled('import { x } from "somepkg";'),
    expect: false,
    info: 'isSvelteCompiled false for regular imports',
  },
  {
    fn: () => isSvelteCompiled("import * as other from 'svelte/internal/';"),
    expect: false,
    info: 'isSvelteCompiled requires namespace named $',
  },

  // --- getSvelteReexports / hasSvelteReexports ---
  {
    fn: () => {
      const r = getSvelteReexports('export { Foo } from "./Foo.svelte";')
      return r.length === 1 && r[0]!.source === './Foo.svelte'
    },
    expect: true,
    info: 'getSvelteReexports detects named re-export from .svelte',
  },
  {
    fn: () => hasSvelteReexports('export * from "./Bar.svelte";'),
    expect: true,
    info: 'hasSvelteReexports detects star re-export from .svelte',
  },
  {
    fn: () => hasSvelteReexports('export { x } from "./mod.js";'),
    expect: false,
    info: 'hasSvelteReexports false for non-svelte source',
  },
  {
    fn: () => hasSvelteReexports('const x = 1;'),
    expect: false,
    info: 'hasSvelteReexports false for no exports',
  },
  {
    fn: () => {
      const r = getSvelteReexports('export { A } from "./A.svelte";\nexport * from "./B.svelte";')
      return r.length === 2 && r[0]!.source === './A.svelte' && r[1]!.source === './B.svelte'
    },
    expect: true,
    info: 'getSvelteReexports collects multiple re-exports',
  },

  // --- getExportStarTargets / hasExportStar ---
  {
    fn: () => getExportStarTargets('export * from "pkg";'),
    expect: ['pkg'],
    info: 'getExportStarTargets returns star targets',
  },
  {
    fn: () => hasExportStar('export * from "a"; export * from "b";'),
    expect: true,
    info: 'hasExportStar true with multiple star exports',
  },
  {
    fn: () => hasExportStar('export { x } from "a";'),
    expect: false,
    info: 'hasExportStar false for named exports only',
  },
  {
    fn: () => getExportStarTargets('const x = 1;'),
    expect: [],
    info: 'getExportStarTargets empty for no exports',
  },

  // --- getExportNamedTargets ---
  {
    fn: () => getExportNamedTargets('export { x, y } from "pkg";'),
    expect: ['pkg'],
    info: 'getExportNamedTargets returns named re-export source',
  },
  {
    fn: () => {
      // plain export declaration (no source) is not a re-export
      return getExportNamedTargets('export const x = 1;')
    },
    expect: [],
    info: 'getExportNamedTargets ignores plain export declarations',
  },

  // --- clearAstCache ---
  {
    fn: () => {
      // exercise analysis cache, then clear
      hasSvelteRunes('const a = $state(1)')
      isSvelteCompiled('const b = 1')
      clearAstCache()
      // still works after clear
      return hasSvelteRunes('const c = $state(2)') === true
    },
    expect: true,
    info: 'clearAstCache resets cache without breaking analysis',
  },
]

export default tests
