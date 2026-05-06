import type { TestCollection, TestObject, WrappedTest } from '../types.js'
export declare const testImportsMutableModuleState: (
  tests: TestCollection | TestObject | WrappedTest[],
  testFilePath: string,
) => Promise<boolean>
export declare const testUsesFixedPorts: (
  tests: TestCollection | TestObject | WrappedTest[],
) => boolean
export declare const testUsesSharedFiles: (
  tests: TestCollection | TestObject | WrappedTest[],
) => boolean
