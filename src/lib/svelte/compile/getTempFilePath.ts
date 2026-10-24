import path from 'node:path'

import { CACHE_DIR, getCwd } from '../../../constants.js'

export const getTempFilePath = (sourceFilePath: string): string => {
  let rel = path.relative(getCwd(), sourceFilePath)
  // Sources outside the project (e.g. file:-symlinked node_modules packages)
  // produce `../`-prefixed relatives that would escape CACHE_DIR and dump
  // compiled output into the project tree — anchor them under `outside/`.
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    rel = path.join('outside', sourceFilePath)
  }
  const tmpFile = path.join(CACHE_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}
