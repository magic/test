import { classifyImport } from '../../../../src/lib/svelte/viteConfig/classifyImport.js'

export default [
  {
    fn: () => classifyImport('./relative') === 'relative',
    expect: true,
    info: 'classifyImport returns relative for ./ paths',
  },
  {
    fn: () => classifyImport('../parent') === 'relative',
    expect: true,
    info: 'classifyImport returns relative for ../ paths',
  },
  {
    fn: () => classifyImport('@scoped/package') === 'scoped',
    expect: true,
    info: 'classifyImport returns scoped for @ prefixed paths',
  },
  {
    fn: () => classifyImport('$lib') === 'vite-alias',
    expect: true,
    info: 'classifyImport returns vite-alias for $lib',
  },
  {
    fn: () => classifyImport('$app/store') === 'vite-alias',
    expect: true,
    info: 'classifyImport returns vite-alias for $app paths',
  },
  {
    fn: () => classifyImport('$env/static') === 'vite-alias',
    expect: true,
    info: 'classifyImport returns vite-alias for $env paths',
  },
  {
    fn: () => classifyImport('svelte') === 'bare',
    expect: true,
    info: 'classifyImport returns bare for svelte package',
  },
  {
    fn: () => classifyImport('react') === 'bare',
    expect: true,
    info: 'classifyImport returns bare for regular packages',
  },
  {
    fn: () => classifyImport('/absolute') === 'bare',
    expect: true,
    info: 'classifyImport returns bare for /absolute paths',
  },
  {
    fn: () => classifyImport('lodash/clone') === 'bare',
    expect: true,
    info: 'classifyImport handles subpath imports',
  },
  {
    fn: () => classifyImport('./foo.js') === 'relative',
    expect: true,
    info: 'classifyImport handles .js extension',
  },
  {
    fn: () => classifyImport('./foo.svelte') === 'relative',
    expect: true,
    info: 'classifyImport handles .svelte extension',
  },
]
