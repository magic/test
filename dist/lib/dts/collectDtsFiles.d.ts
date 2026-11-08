/**
 * Recursively collect all .d.ts files below rootDir.
 * Returns absolute paths, sorted for stable test ordering.
 */
export declare const collectDtsFiles: (rootDir: string) => Promise<string[]>
