import path from 'node:path'
import fs from '@magic/fs'
import { FileFilter } from '../coverage/filter.js'
/**
 * Directory names that are never searched for .d.ts files.
 * `test` is excluded because test fixtures may intentionally contain broken
 * declaration files; `node_modules`/`dist` hold third-party or generated code.
 */
const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.tmp', 'docs', 'test', '.fixtures'])
/**
 * Recursively collect all .d.ts files below rootDir.
 * Returns absolute paths, sorted for stable test ordering.
 *
 * `excludes` are CLI --exclude glob patterns (test-exclude semantics, relative
 * to rootDir): matching files are skipped, a pattern like `foo` also skips
 * everything below `foo`, and `!pattern` re-includes. They are additive on
 * top of SKIP_DIRS, which always applies.
 */
export const collectDtsFiles = async (rootDir, excludes = []) => {
  const found = []
  const filter = new FileFilter({ cwd: rootDir, exclude: excludes })
  const walk = async dir => {
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue
      }
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          await walk(full)
        }
      } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
        if (filter.shouldInstrument(full)) {
          found.push(full)
        }
      }
    }
  }
  await walk(rootDir)
  return found.sort()
}
//# sourceMappingURL=collectDtsFiles.js.map
