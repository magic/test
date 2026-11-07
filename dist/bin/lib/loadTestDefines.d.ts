/**
 * Vite define values may be pre-stringified JSON (e.g. '"my url"') or raw
 * literals (e.g. a bare 'http://localhost:9000'). Parse JSON when possible,
 * otherwise keep the raw string so a non-JSON define does not crash the
 * whole import.
 */
export declare const parseDefineValue: (value: string) => unknown
export declare const loadTestDefines: (rootDir: string) => Promise<Record<string, unknown>>
