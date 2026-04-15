export declare const testModifiesGlobals: (test: {
  before?: (...args: unknown[]) => unknown
  after?: (...args: unknown[]) => unknown
}) => boolean
export declare const suiteModifiesGlobals: (tests: unknown) => boolean
export declare const suiteBeforeAllModifiesGlobals: (tests: unknown) => boolean
export declare const suiteAfterAllModifiesGlobals: (tests: unknown) => boolean
