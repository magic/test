/**
 * Local replacement for c8.
 *
 * Reads the V8 coverage JSON files Node.js writes to NODE_V8_COVERAGE,
 * merges them, remaps them through the source maps Node cached in the
 * same files and prints a text report. No external dependencies.
 */
import path from 'node:path'
import fs from 'node:fs'
import is from '@magic/types'
import { loadCoverage } from './v8read.js'
import { FileFilter } from './filter.js'
import { convertScript, mergeFileCoverage } from './convert.js'
const readCache = new Map()
/** reads a source file, null when it cannot be read */
const readSource = p => {
  const cached = readCache.get(p)
  if (cached !== undefined) return cached
  let result
  try {
    result = fs.readFileSync(p, 'utf8')
  } catch {
    result = null
  }
  readCache.set(p, result)
  return result
}
/**
 * Reads an adjacent (`.map` file referenced by a sourceMappingURL comment)
 * or inline source map for a file. Used when Node's source-map cache has no
 * entry for a script (v8-to-istanbul falls back to the same lookup).
 */
const getSourceMapFromFile = filePath => {
  let raw
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
  // inline data: source map
  const inline = raw.match(
    /\/\/[@#]\s*sourceMappingURL=data:application\/json;charset=utf-8;base64,([^\s"'`]+)/,
  )
  if (inline && inline[1]) {
    try {
      const data = JSON.parse(Buffer.from(inline[1], 'base64').toString('utf8'))
      if (data && is.string(data.mappings)) {
        return data
      }
    } catch {
      return null
    }
  }
  // external .map file
  const ref = raw.match(/\/\/[@#]\s*sourceMappingURL=(.+)$/m)
  if (ref && ref[1]) {
    const mapPath = path.resolve(path.dirname(filePath), ref[1].trim())
    try {
      const data = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
      if (data && is.string(data.mappings)) {
        return data
      }
    } catch {
      return null
    }
  }
  return null
}
/** synthesizes the V8 script coverage c8 uses for `--all` empty reports */
const emptyReportFor = filePath => {
  let size = 0
  try {
    size = fs.statSync(filePath).size
  } catch {
    size = 0
  }
  return {
    scriptId: 0,
    url: filePath,
    functions: [
      {
        functionName: '(empty-report)',
        ranges: size > 0 ? [{ startOffset: 0, endOffset: size, count: 0 }] : [],
        isBlockCoverage: true,
      },
    ],
  }
}
/**
 * Rebuilds the executed (transpiled) source from the per-line lengths V8
 * records in its source-map cache, the same way c8 does: each line is padded
 * with dots. Only the line structure matters for remapping.
 */
const transpiledSourceFromLineLengths = lineLengths => {
  if (!lineLengths || !is.array(lineLengths)) return null
  let source = ''
  for (const length of lineLengths) {
    source += '.'.repeat(Math.max(0, length)) + '\n'
  }
  return source
}
/**
 * Builds the merged Istanbul-style coverage map from the V8 coverage data in
 * tempDir (one FileCoverage per reportable original file).
 */
export const buildCoverageMap = async opts => {
  const filter = new FileFilter({
    cwd: opts.cwd,
    include: opts.include,
    exclude: opts.exclude,
    extensions: opts.extensions,
  })
  const { scripts, sourceMapCache, coveredPaths } = await loadCoverage(opts.tempDir)
  const toConvert = []
  for (const script of scripts) {
    // urls are absolute paths after loading (c8's _normalizeProcessCov)
    const filePath = script.url
    if (!path.isAbsolute(filePath)) continue
    if (!opts.excludeAfterRemap && !filter.shouldInstrument(filePath)) continue
    const cacheEntry = sourceMapCache[filePath]
    toConvert.push({
      script,
      sourceMap: cacheEntry?.data ?? null,
      transpiledSource: transpiledSourceFromLineLengths(cacheEntry?.lineLengths),
    })
  }
  // --all: add empty (0%) coverage for matching files that were never loaded
  if (opts.all) {
    const allFiles = await filter.globAll()
    for (const file of allFiles) {
      if (coveredPaths.has(file)) continue
      toConvert.push({
        script: emptyReportFor(file),
        sourceMap: null,
        transpiledSource: null,
      })
    }
  }
  const files = new Map()
  for (const item of toConvert) {
    // scripts without a cached source map (Node records the cache only for
    // some of the scripts it loads) fall back to an inline/adjacent source
    // map on disk, the same way v8-to-istanbul does
    let sourceMap = item.sourceMap
    if (!sourceMap) {
      sourceMap = getSourceMapFromFile(item.script.url)
    }
    const results = convertScript(item.script, {
      sourceMap,
      transpiledSource: item.transpiledSource,
      readSource,
      excludeAfterRemap: opts.excludeAfterRemap ? p => !filter.shouldInstrument(p) : undefined,
    })
    for (const fc of results) {
      mergeFileCoverage(files, fc)
    }
  }
  return files
}
// The print entry point is stats.coverage (src/lib/stats/coverage.ts), which
// composes buildCoverageMap + printTextReport.
//# sourceMappingURL=index.js.map
