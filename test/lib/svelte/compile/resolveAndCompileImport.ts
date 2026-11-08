import { classifyImport } from '#lib/svelte/viteConfig/classifyImport.js'

export default [
  {
    fn: () => classifyImport('./relative'),
    expect: 'relative',
    info: 'classifyImport returns relative for ./ paths',
  },
  {
    fn: () => classifyImport('../parent'),
    expect: 'relative',
    info: 'classifyImport returns relative for ../ paths',
  },
  {
    fn: () => classifyImport('@scoped/package'),
    expect: 'scoped',
    info: 'classifyImport returns scoped for @ prefixed paths',
  },
  {
    fn: () => classifyImport('$lib'),
    expect: 'vite-alias',
    info: 'classifyImport returns vite-alias for $lib',
  },
  {
    fn: () => classifyImport('$app/store'),
    expect: 'vite-alias',
    info: 'classifyImport returns vite-alias for $app paths',
  },
  {
    fn: () => classifyImport('$env/static'),
    expect: 'vite-alias',
    info: 'classifyImport returns vite-alias for $env paths',
  },
  {
    fn: () => classifyImport('svelte'),
    expect: 'bare',
    info: 'classifyImport returns bare for svelte package',
  },
  {
    fn: () => classifyImport('react'),
    expect: 'bare',
    info: 'classifyImport returns bare for regular packages',
  },
  {
    fn: () => classifyImport('/absolute'),
    expect: 'bare',
    info: 'classifyImport returns bare for /absolute paths',
  },
  {
    fn: () => classifyImport('lodash/clone'),
    expect: 'bare',
    info: 'classifyImport handles subpath imports',
  },
  {
    fn: () => classifyImport('./foo.js'),
    expect: 'relative',
    info: 'classifyImport handles .js extension',
  },
  {
    fn: () => classifyImport('./foo.svelte'),
    expect: 'relative',
    info: 'classifyImport handles .svelte extension',
  },
  {
    fn: () => classifyImport('#lib'),
    expect: 'bare',
    info: 'classifyImport returns bare for #lib prefix',
  },
  {
    fn: () => classifyImport('#lib/components/Figure.svelte'),
    expect: 'bare',
    info: 'classifyImport returns bare for #lib/components path',
  },
  {
    fn: () => classifyImport('#lib/forms/Button.svelte'),
    expect: 'bare',
    info: 'classifyImport returns bare for #lib/forms path',
  },
]
