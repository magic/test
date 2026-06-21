import { createCanvasPolyfill } from '../../../src/lib/dom/canvas.js'
import type { TestCase } from '../../../src/types.js'

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
      return ctx !== undefined
    },
    expect: true,
    info: 'canvas.getContext("webgl") returns something (may be null)',
  },
  // toDataURL exists on context
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      return typeof ctx?.toDataURL === 'function'
    },
    expect: true,
    info: 'context has toDataURL method',
  },
  // drawImage exists on context
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      return typeof ctx?.drawImage === 'function'
    },
    expect: true,
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
      return ctx?.canvas.width === 300 && ctx?.canvas.height === 150
    },
    expect: true,
    info: 'canvas dimensions are preserved in context',
  },
  // toDataURL with custom mime type
  {
    fn: () => {
      createCanvasPolyfill()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const result = ctx?.toDataURL('image/jpeg', 0.8)
      return typeof result === 'string'
    },
    expect: true,
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
      const ctx1 = canvas1.getContext('2d') as any
      const ctx2 = canvas2.getContext('2d') as any
      return ctx1 !== ctx2
    },
    expect: true,
    info: 'different canvases get different contexts',
  },
] satisfies TestCase[]
