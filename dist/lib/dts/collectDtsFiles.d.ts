/**
 * Recursively collect all .d.ts files below rootDir.
 * Returns absolute paths, sorted for stable test ordering.
 *
 * `excludes` are CLI --exclude glob patterns (test-exclude semantics, relative
 * to rootDir): matching files are skipped, a pattern like `foo` also skips
 * everything below `foo`, and `!pattern` re-includes. They are additive on
 * top of SKIP_DIRS, which always applies.
 */
export declare const collectDtsFiles: (rootDir: string, excludes?: string[]) => Promise<string[]>
