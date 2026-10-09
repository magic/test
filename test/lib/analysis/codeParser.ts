import {
  getImportNames,
  mutatesImportedState,
  getPortPatterns,
  getFilePaths,
} from '#lib/analysis/codeParser.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // --- getImportNames ---
  {
    fn: () => getImportNames('import { foo, bar } from "pkg"'),
    expect: ['foo', 'bar'],
    info: 'getImportNames extracts named imports',
  },
  {
    fn: () => getImportNames('import foo from "pkg"'),
    expect: ['foo'],
    info: 'getImportNames extracts default import',
  },
  {
    fn: () => getImportNames('import * as pkg from "pkg"'),
    expect: ['pkg'],
    info: 'getImportNames extracts namespace import',
  },
  {
    fn: () => getImportNames('import { foo as f } from "pkg"'),
    expect: ['foo'],
    info: 'getImportNames uses imported name for aliased imports',
  },
  {
    fn: () => getImportNames('const x = 1'),
    expect: [],
    info: 'getImportNames returns empty for no imports',
  },
  {
    fn: () => getImportNames('import a from "a"\nimport { b } from "b"\nexport const c = 1'),
    expect: ['a', 'b'],
    info: 'getImportNames handles multiple imports',
  },

  // --- mutatesImportedState ---
  {
    fn: () => mutatesImportedState('state.count = 1', ['state']),
    expect: true,
    info: 'mutatesImportedState detects direct member assignment',
  },
  {
    fn: () => mutatesImportedState('state.items.push(1)', ['state']),
    expect: false,
    info: 'mutatesImportedState does not flag method calls like push (no assignment node)',
  },
  {
    fn: () => mutatesImportedState('state.nested.deep.value = 1', ['state']),
    expect: true,
    info: 'mutatesImportedState detects nested member assignment',
  },
  {
    fn: () => mutatesImportedState('state.items[0] = 5', ['state']),
    expect: true,
    info: 'mutatesImportedState detects index assignment',
  },
  {
    fn: () => mutatesImportedState('state.count++', ['state']),
    expect: true,
    info: 'mutatesImportedState detects update expression',
  },
  {
    fn: () => mutatesImportedState('delete state.items[0]', ['state']),
    expect: true,
    info: 'mutatesImportedState detects delete expression',
  },
  {
    fn: () => mutatesImportedState('console.log(state.count)', ['state']),
    expect: false,
    info: 'mutatesImportedState does not flag reads',
  },
  {
    fn: () => mutatesImportedState('local.count = 1', ['state']),
    expect: false,
    info: 'mutatesImportedState ignores non-imported identifiers',
  },
  {
    fn: () => mutatesImportedState('state.count = 1', []),
    expect: false,
    info: 'mutatesImportedState returns false with no import names',
  },
  {
    fn: () => mutatesImportedState('(() => { state.count = 1 })()', ['state']),
    expect: true,
    info: 'mutatesImportedState recurses into nested expressions',
  },
  {
    fn: () => mutatesImportedState('if (true) { state.x = 1 }', ['state']),
    expect: true,
    info: 'mutatesImportedState recurses into control flow',
  },
  {
    fn: () => mutatesImportedState('for (const k in state) {}', ['state']),
    expect: false,
    info: 'mutatesImportedState does not flag iteration',
  },

  // --- getPortPatterns ---
  {
    fn: () => getPortPatterns('server.listen(3000)'),
    expect: ['.listen(3000'],
    info: 'getPortPatterns detects .listen(N)',
  },
  {
    fn: () => getPortPatterns('const port = 8080'),
    expect: [],
    info: 'getPortPatterns ignores plain variables',
  },
  {
    fn: () => getPortPatterns('server.listen(0)'),
    expect: ['.listen(0'],
    info: 'getPortPatterns detects .listen(0) (random port)',
  },
  {
    fn: () => getPortPatterns('createServer({ port: 4000 })'),
    expect: ['port: 4000'],
    info: 'getPortPatterns detects port: N option',
  },
  {
    fn: () => getPortPatterns('fetch("http://localhost:5000/x")'),
    expect: ['fetch("http://localhost:5000'],
    info: 'getPortPatterns detects localhost fetch with port',
  },
  {
    fn: () => getPortPatterns('globalThis.testPort = 3000'),
    expect: ['globalThis.testPort'],
    info: 'getPortPatterns detects globalThis.*Port*',
  },
  {
    fn: () => getPortPatterns('no ports here'),
    expect: [],
    info: 'getPortPatterns returns empty for no ports',
  },

  // --- getFilePaths ---
  {
    fn: () => getFilePaths('fs.readFile("/tmp/a.txt")'),
    expect: ['/tmp/a.txt'],
    info: 'getFilePaths extracts fs method paths',
  },
  {
    fn: () => getFilePaths("fs.writeFileSync('out.txt', 'data')"),
    expect: ['out.txt'],
    info: 'getFilePaths extracts fs write paths',
  },
  {
    fn: () => getFilePaths('globalThis.myFile = 1'),
    expect: ['globalThis.myFile'],
    info: 'getFilePaths detects globalThis.*File*',
  },
  {
    fn: () => getFilePaths('fs.readFile("/a") + fs.readFile("/b")'),
    expect: ['/a', '/b'],
    info: 'getFilePaths extracts multiple paths',
  },
  {
    fn: () => getFilePaths('no files here'),
    expect: [],
    info: 'getFilePaths returns empty for no files',
  },
]

export default tests
