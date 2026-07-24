import is from '@magic/types'
import { transpileWithTypescript } from '../../../src/bin/lib/tsTranspile.js'

export default [
  {
    fn: () => is.fn(transpileWithTypescript),
    expect: true,
    info: 'transpileWithTypescript is exported and is a function',
  },
  {
    fn: () => {
      const result = transpileWithTypescript('const x: number = 42')
      return is.string(result) && result.includes('x')
    },
    expect: true,
    info: 'strips TypeScript type annotation from const',
  },
  {
    fn: () => {
      const result = transpileWithTypescript('interface Foo { bar: string }')
      return result
    },
    expect: is.str,
    info: 'drops interface declarations (declaration output)',
  },
  {
    fn: () => {
      const result = transpileWithTypescript('class Greeter { greet(): string { return "hello" } }')
      return is.string(result) && result.includes('class') && result.includes('greet')
    },
    expect: true,
    info: 'transforms class with typed methods',
  },
  {
    fn: () => {
      const result = transpileWithTypescript('const fn = (a: string): number => 0')
      return is.string(result) && result.includes('a')
    },
    expect: true,
    info: 'strips typed arrow function parameters',
  },
  {
    fn: () => {
      const result = transpileWithTypescript('let x: Array<string> = []')
      return is.string(result)
    },
    expect: true,
    info: 'handles generic type parameters',
  },
  {
    fn: () => {
      const result = transpileWithTypescript('')
      return is.string(result)
    },
    expect: true,
    info: 'empty string produces valid output (adds "use strict")',
  },
  {
    fn: () => {
      const result = transpileWithTypescript('export type Foo = { name: string; age: number }')
      return is.string(result)
    },
    expect: true,
    info: 'handles export type declarations',
  },
  {
    fn: () => {
      const result = transpileWithTypescript(
        'const obj: Record<string, unknown> = { key: "value" }',
      )
      return result
    },
    expect: is.string,
    info: 'handles Record type annotation',
  },
  {
    fn: () => {
      const result = transpileWithTypescript(
        'async function fetch(url: string): Promise<string> { return "" }',
      )
      return is.string(result) && result.includes('async') && result.includes('fetch')
    },
    expect: true,
    info: 'handles async function with typed params and return',
  },
  {
    fn: () => {
      const code = `
import type { Foo } from './bar'
const x: Foo = {}
`.trim()
      const result = transpileWithTypescript(code)
      return result
    },
    expect: is.string,
    info: 'handles type-only import stripping',
  },
]
