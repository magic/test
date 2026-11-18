export declare const sourceMapCommentFor: (tmpFileAbs: string) => string
export declare const writeMapSidecar: (
  tmpFileAbs: string,
  map: string | undefined,
  sourcePath?: string,
) => Promise<boolean>
export declare const writeCompiledFile: (
  tempPath: string,
  code: string,
  map?: string,
  sourceMapRef?: boolean,
  sourcePath?: string,
) => Promise<{
  tmpFile: string
  importUrl: string
}>
