import type { Test, TestCollection, TestObject } from '../types.ts'
export declare const functionModifiesGlobals: (fn: unknown) => boolean
export declare const testModifiesGlobals: (test: Test) => boolean
export declare const suiteModifiesGlobals: (tests: TestCollection | TestObject) => boolean
