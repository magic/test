export function testModifiesGlobals(test: { before?: Function; after?: Function }): boolean
export function suiteModifiesGlobals(tests: unknown): boolean
export function suiteBeforeAllModifiesGlobals(tests: unknown): boolean
export function suiteAfterAllModifiesGlobals(tests: unknown): boolean
export function testImportsMutableModuleState(
  tests: unknown,
  testFilePath: string,
): Promise<boolean>
export function testUsesFixedPorts(tests: unknown): boolean
export function testUsesSharedFiles(tests: unknown): boolean
//# sourceMappingURL=testModifiesGlobals.d.ts.map
