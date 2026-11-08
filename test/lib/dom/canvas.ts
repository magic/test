import is from '@magic/types'
import { has } from '#lib/has.js'
import { createCanvasPolyfill } from '#lib/dom/canvas.js'
import type { TestCase } from '#src/types.js'

export default [
  // createCanvasPolyfill - called twice should not throw
  {
    fn: () => {
      createCanvasPolyfill()
      createCanvasPolyfill()
      return true
    },
    expect: true,
    info: 'calling createCanvasPolyfill twice is safe',
  },
  // Canvas element gets 2d context
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      return !!ctx
    },
    expect: true,
    info: 'canvas.getContext("2d") returns a context',
  },
  // Non-2d context returns original/undefined
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      // webgl might not exist in happy-dom, but we can try
      const ctx = canvas.getContext('webgl')
      return ctx
    },
    expect: (v: unknown) => v !== undefined,
    info: 'canvas.getContext("webgl") returns something (may be null)',
  },
  // toDataURL exists on context
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      return (ctx as unknown as Record<string, unknown>)?.toDataURL
    },
    expect: is.function,
    info: 'context has toDataURL method',
  },
  // drawImage exists on context
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      return (ctx as unknown as Record<string, unknown>)?.drawImage
    },
    expect: is.function,
    info: 'context has drawImage method',
  },
  // fillRect works
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx?.fillRect(0, 0, 10, 10)
      return true
    },
    expect: true,
    info: 'fillRect does not throw',
  },
  // canvas dimensions are respected
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 150
      const ctx = canvas.getContext('2d') as { canvas: { width: number; height: number } } | null
      return { width: ctx?.canvas.width, height: ctx?.canvas.height }
    },
    expect: has.properties({ width: 300, height: 150 }),
    info: 'canvas dimensions are preserved in context',
  },
  // toDataURL with custom mime type
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
      const toDataURL = (
        ctx as unknown as Record<string, (mime?: string, quality?: number) => string | undefined>
      )?.toDataURL
      const result = toDataURL?.call(ctx, 'image/jpeg', 0.8)
      return result
    },
    expect: is.string,
    info: 'toDataURL returns string (may be empty if no impl)',
  },
  // Multiple canvases get independent contexts
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas1 = document.createElement('canvas')
      const canvas2 = document.createElement('canvas')
      canvas1.width = 100
      canvas2.width = 200
      const ctx1 = canvas1.getContext('2d')
      const ctx2 = canvas2.getContext('2d')
      // Different canvas elements should have different context instances
      return { ctx1, ctx2 }
    },
    expect: (v: { ctx1: unknown; ctx2: unknown }) =>
      v.ctx1 !== null && v.ctx2 !== null && v.ctx1 !== v.ctx2,
    info: 'different canvases get different contexts',
  },
] satisfies TestCase[]
