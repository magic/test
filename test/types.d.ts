import type { TestObject, TestCollection, ComponentProps, State, Store } from '@magic/test'

declare global {
  interface GlobalThis {
    before?: boolean
    tests?: TestObject
    beforeAll?: string
    store?: Store
    [key: string]: unknown
  }
}

export {}
