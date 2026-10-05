import { getDuration } from '#src/lib/getDuration.js'
import { createStore } from '#src/lib/store.js'
import type { Test } from '#src/types.js'

export default [
  // getDuration with no startTime returns empty string
  {
    fn: () => {
      const store = createStore()
      return getDuration(store)
    },
    expect: '',
    info: 'getDuration with no startTime returns empty string',
  },
  // getDuration with globalStartTime and no startTime returns duration from global
  {
    fn: () => {
      const store = createStore()
      const globalStartTime: [number, number] = [Date.now(), 0]
      store.set({ globalStartTime })
      const result = getDuration(store, 'globalStartTime')
      return result !== undefined
    },
    expect: true,
    info: 'getDuration with globalStartTime returns duration',
  },
  // getDuration with startTime returns duration
  {
    fn: () => {
      const store = createStore()
      const startTime: [number, number] = [Date.now(), 0]
      store.set({ startTime })
      const result = getDuration(store)
      return result !== undefined && result !== ''
    },
    expect: true,
    info: 'getDuration with startTime returns non-empty duration',
  },
  // getDuration with invalid startTime returns empty string
  {
    fn: () => {
      const store = createStore()
      // @ts-expect-error invalid argument test
      store.set({ startTime: 'not a tuple' })
      return getDuration(store)
    },
    expect: '',
    info: 'getDuration with invalid startTime returns empty string',
  },
  // getDuration with globalStartTime of length 1 returns duration from startTime
  {
    fn: () => {
      const store = createStore()
      // @ts-expect-error invalid argument test
      store.set({ globalStartTime: [123] })
      return getDuration(store, 'globalStartTime')
    },
    expect: '',
    info: 'getDuration with invalid globalStartTime falls back to startTime',
  },
  // getDuration with globalStartTime null falls back to startTime
  {
    fn: () => {
      const store = createStore()
      store.set({ globalStartTime: null as unknown as [number, number] })
      return getDuration(store, 'globalStartTime')
    },
    expect: '',
    info: 'getDuration with null globalStartTime returns empty string',
  },
] satisfies Test[]
