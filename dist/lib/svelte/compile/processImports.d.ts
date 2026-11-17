export declare const processImports: (
  code: string,
  sourceFilePath: string,
  importChain?: string[],
  /** Bypass the (filePath, code-hash) result cache. Used when re-running
   *  resolution after known-bad external state (e.g. a compiled dependency
   *  artifact was deleted) — the cached rewrite would still point at the
   *  stale artifacts even though the source code is unchanged. */
  force?: boolean,
) => Promise<string>
