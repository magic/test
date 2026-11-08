import { buildUnitCommand } from '#src/bin/t.js'
import type { TestCase } from '#src/types.js'

const base = {
  isWin: false,
  cwd: '/proj',
  include: ['src'],
  exclude: null,
}

export default [
  {
    fn: () => buildUnitCommand({ ...base, isProd: true, name: '@magic/test' }),
    expect: {
      cmd: 'node',
      argv: ['/proj/dist/bin/unit.js'],
    },
    info: 'prod mode: @magic/test uses local dist/bin/unit.js',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: true, name: 'other-pkg' }),
    expect: {
      cmd: 'node',
      argv: ['/proj/node_modules/@magic/test/dist/bin/unit.js'],
    },
    info: 'prod mode: other packages use node_modules bin',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: false, name: '@magic/test' }),
    expect: {
      cmd: '/proj/node_modules/.bin/c8',
      argv: [
        '--exclude',
        'test',
        '--exclude',
        '**/*.d.ts',
        '--source-maps',
        '--extension',
        '.js',
        '--extension',
        '.mjs',
        '--extension',
        '.ts',
        '--extension',
        '.svelte',
        '--exclude-after-remap',
        '--all',
        '--include',
        'src',
        'node',
        '/proj/dist/bin/unit.js',
      ],
    },
    info: 'coverage mode: c8 wraps unit.js with default excludes and includes',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: false, isWin: true, name: 'other-pkg' }),
    expect: (v: { cmd: string; argv: string[] }) =>
      v.cmd === '/proj/node_modules/.bin/c8.cmd' &&
      v.argv.includes('--source-maps') &&
      v.argv[v.argv.length - 2] === 'node' &&
      v.argv[v.argv.length - 1] === '/proj/node_modules/@magic/test/dist/bin/unit.js',
    info: 'coverage mode on windows uses c8.cmd',
  },
  {
    fn: () => buildUnitCommand({ ...base, isProd: false, exclude: ['custom'], name: 'other-pkg' }),
    expect: (v: { argv: string[] }) => {
      const idx = v.argv.indexOf('--exclude')
      return (
        v.argv[idx + 1] === 'custom' &&
        v.argv[idx + 3] === '**/*.d.ts' &&
        v.argv.filter((x, i) => x === 'test' && v.argv[i - 1] === '--exclude').length === 0
      )
    },
    info: 'coverage mode: custom exclude replaces default but .d.ts still appended',
  },
  {
    fn: () =>
      buildUnitCommand({ ...base, isProd: false, exclude: ['**/*.d.ts'], name: 'other-pkg' }),
    expect: (v: { argv: string[] }) => v.argv.filter(x => x === '**/*.d.ts').length === 1,
    info: 'coverage mode: .d.ts is not duplicated when already excluded',
  },
  {
    fn: () =>
      buildUnitCommand({ ...base, isProd: false, include: ['src', 'lib'], name: 'other-pkg' }),
    expect: (v: { argv: string[] }) =>
      v.argv.includes('--include') && v.argv.includes('src') && v.argv.includes('lib'),
    info: 'coverage mode: multiple includes are all passed to c8',
  },
] satisfies TestCase[]
