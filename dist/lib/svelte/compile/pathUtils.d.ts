export declare const EXTENSION_CANDIDATES: string[]
export declare const FALLBACK_CANDIDATES: string[]
export declare const isSkipPattern: (spec: string) => boolean
export declare const resolveFilePath: (
  base: string,
  extensions?: string[],
) => Promise<string | null>
