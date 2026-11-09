import { buildUnitCommand } from '#src/bin/t.js'
import type { TestCase } from '#src/types.js'

const base = {
  cwd: '/proj',
  include: ['src'],
  exclude: null,
}

const COVERAGE_BASE = {
  tempDir: '/proj/coverage/tmp',
  reportsDir: '/proj/coverage',
  extensions: ['.js', '.mjs', '.ts', '.svelte'],
  all: true,
  excludeAfterRemap: true,
}

export default [
  {
    fn: () => buildUnitCommand({ ...base, isProd: true, name: '@magic/test' }),
    expect: {
      cmd: 'node',
      argv: ['/proj/dist/bin/unit.js'],
      coverage: null,
    },
    info: 'prod mode: @magic/test uses local dist/bin/unit.js without coverage',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: true, name: 'other-pkg' }),
    expect: {
      cmd: 'node',
      argv: ['/proj/node_modules/@magic/test/dist/bin/unit.js'],
      coverage: null,
    },
    info: 'prod mode: other packages use node_modules bin without coverage',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: false, name: '@magic/test' }),
    expect: {
      cmd: 'node',
      argv: ['/proj/dist/bin/unit.js'],
      coverage: {
        ...COVERAGE_BASE,
        include: ['src'],
        exclude: ['test', '**/*.d.ts'],
      },
    },
    info: 'coverage mode: plain node run with coverage options and default excludes',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: false, name: 'other-pkg' }),
    expect: (v: ReturnType<typeof buildUnitCommand>) =>
      v.cmd === 'node' &&
      v.argv[v.argv.length - 1] === '/proj/node_modules/@magic/test/dist/bin/unit.js' &&
      Boolean(v.coverage),
    info: 'coverage mode: other packages use node_modules bin',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: false, exclude: ['custom'], name: 'other-pkg' }),
    expect: (v: ReturnType<typeof buildUnitCommand>) =>
      v.coverage !== null &&
      v.coverage.exclude.includes('custom') &&
      v.coverage.exclude.includes('**/*.d.ts') &&
      !v.coverage.exclude.includes('test'),
    info: 'coverage mode: custom exclude replaces default but .d.ts still appended',
  },
  {
    fn: () =>
      buildUnitCommand({ ...base, isProd: false, exclude: ['**/*.d.ts'], name: 'other-pkg' }),
    expect: (v: ReturnType<typeof buildUnitCommand>) =>
      v.coverage !== null && v.coverage.exclude.filter(x => x === '**/*.d.ts').length === 1,
    info: 'coverage mode: .d.ts is not duplicated when already excluded',
  },
  {
    fn: () =>
      buildUnitCommand({ ...base, isProd: false, include: ['src', 'lib'], name: 'other-pkg' }),
    expect: (v: ReturnType<typeof buildUnitCommand>) =>
      v.coverage !== null &&
      v.coverage.include.includes('src') &&
      v.coverage.include.includes('lib'),
    info: 'coverage mode: multiple includes are all passed to the coverage report',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: true, name: '@magic/test', native: true }),
    expect: {
      cmd: 'node',
      argv: ['--test', '/proj/dist/bin/node-test-runner.js'],
      coverage: null,
    },
    info: 'native prod mode: node --test node-test-runner.js without coverage',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: false, name: '@magic/test', native: true }),
    expect: {
      cmd: 'node',
      argv: ['--test', '/proj/dist/bin/node-test-runner.js'],
      coverage: {
        ...COVERAGE_BASE,
        include: ['src'],
        exclude: ['test', '**/*.d.ts'],
      },
    },
    info: 'native coverage mode: node --test runner with local coverage options',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: false, name: 'other-pkg', native: true }),
    expect: (v: ReturnType<typeof buildUnitCommand>) =>
      v.cmd === 'node' &&
      v.argv[v.argv.length - 2] === '--test' &&
      v.argv[v.argv.length - 1] === '/proj/node_modules/@magic/test/dist/bin/node-test-runner.js' &&
      Boolean(v.coverage),
    info: 'native coverage mode: other packages use node_modules bin',
  },
] satisfies TestCase[]
