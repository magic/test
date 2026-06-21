import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'

import { CACHE_DIR, CWD } from '../../../constants.ts'
import type { CssObject } from './types.ts'
import { transformForNode } from './transformForNode.ts'
import { compileSvelte } from './compileSvelte.ts'
import { processImports } from './processImports.ts'
import { traceStart, traceEnd } from './timing.ts'
import { writeQueue } from './writeQueue.ts'

// Check if file needs writing (skip if content unchanged)
const shouldWriteFile = async (filePath: string, newContent: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(filePath)
    const newSize = Buffer.byteLength(newContent, 'utf-8')
    // Different size = definitely need to write
    if (stats.size !== newSize) {
      return true
    }
    // Same size, verify content
    const existing = await fs.readFile(filePath, 'utf-8')
    return existing !== newContent
  } catch {
    return true
  }
}

export const compileSvelteWithWrite = async (
  filePath: string,
): Promise<{ js: string; css: CssObject | null; tmpFile: string; importUrl: string }> => {
  const id = traceStart(`compileSvelteWithWrite ${path.basename(filePath)}`)
  try {
    // Pure compile (no caching - handled by CacheManager)
    const { js, css } = await compileSvelte(filePath)

    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
    const relPath = path.relative(CWD, resolvedPath)
    const tmpFile = path.join(CACHE_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
    const tmpFileAbs = path.resolve(CWD, tmpFile)
    const importUrl = pathToFileURL(tmpFileAbs).href

    // Transform imports (resolves $app/*, $lib/*, etc.)
    const processId = traceStart('processImports')
    const code = await processImports(js, filePath)
    traceEnd(processId)

    // Node.js compatibility transforms
    const transformId = traceStart('transformForNode')
    const transformedCode = transformForNode(code, filePath)
    traceEnd(transformId)

    // Write to temp file (batched, skip if unchanged)
    const writeId = traceStart('fs.writeFile')
    if (await shouldWriteFile(tmpFileAbs, transformedCode)) {
      await writeQueue.write(tmpFileAbs, transformedCode)
    }
    traceEnd(writeId)

    return { js: transformedCode, css, tmpFile, importUrl }
  } catch (e) {
    traceEnd(id, `ERROR: ${(e as Error).message}`)
    throw e
  }
}
