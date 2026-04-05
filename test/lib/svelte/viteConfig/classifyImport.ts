import { classifyImport } from '../../src/lib/svelte/viteConfig/classifyImport.js'

export default [
  {
    fn: () => classifyImport('./relative'),
    expect: 'relative',
    info: 'classifies ./ as relative',
  },
  {
    fn: () => classifyImport('../parent'),
    expect: 'relative',
    info: 'classifies ../ as relative',
  },
  {
    fn: () => classifyImport('@scoped/package'),
    expect: 'scoped',
    info: 'classifies @ as scoped',
  },
  {
    fn: () => classifyImport('$lib'),
    expect: 'vite-alias',
    info: 'classifies $ as vite-alias',
  },
  {
    fn: () => classifyImport('$app/store'),
    expect: 'vite-alias',
    info: 'classifies $app/ as vite-alias',
  },
  {
    fn: () => classifyImport('$env'),
    expect: 'vite-alias',
    info: 'classifies $env as vite-alias',
  },
  {
    fn: () => classifyImport('react'),
    expect: 'bare',
    info: 'classifies plain package as bare',
  },
  {
    fn: () => classifyImport('svelte'),
    expect: 'bare',
    info: 'classifies svelte as bare',
  },
]
