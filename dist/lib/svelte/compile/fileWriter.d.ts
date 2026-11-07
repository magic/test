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
