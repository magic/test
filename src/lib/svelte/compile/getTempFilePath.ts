import path from 'node:path'

import { CACHE_DIR } from '../../../constants.js'
import { getCacheRelPath } from '../../caches/persistentCache.js'

// Temp file location for a compiled source. MUST stay path-identical to the
// persistent-cache location (getCachePath in persistentCache.ts) — both are
// derived from the shared getCacheRelPath helper so a cache hit can serve the
// same file the miss wrote. Sources outside the project are anchored under
// `outside/` (see getCacheRelPath) so they can never escape CACHE_DIR.
//
// CONTRACT: returns a path RELATIVE to the project cwd. Callers that need an
// absolute path join it with getCwd() themselves — getTempFilePath must never
// return an absolute path, or `path.join(getCwd(), tmpFile)` at the call sites
// would double the prefix.
export const getTempFilePath = (sourceFilePath: string): string => {
  return path.join(CACHE_DIR, getCacheRelPath(sourceFilePath))
}
