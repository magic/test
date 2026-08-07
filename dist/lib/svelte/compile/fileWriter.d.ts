export declare const writeCompiledFile: (
  tempPath: string,
  code: string,
  map?: string,
  sourceMapRef?: boolean,
) => Promise<{
  tmpFile: string
  importUrl: string
}>
