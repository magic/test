import type { TestCollection, TestObject } from '../types.ts'
interface HasTestHooks {
  before?: {
    toString(): string
  }
  after?: {
    toString(): string
  }
}
export declare const testModifiesGlobals: (test: HasTestHooks) => boolean
export declare const suiteModifiesGlobals: (tests: TestCollection | TestObject) => boolean
export declare const suiteBeforeAllModifiesGlobals: (tests: TestCollection | TestObject) => boolean
export declare const suiteAfterAllModifiesGlobals: (tests: TestCollection | TestObject) => boolean
export {}
