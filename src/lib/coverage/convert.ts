/**
 * Converts V8 script coverage to Istanbul-format file coverage.
 *
 * A faithful minimal port of the v8-to-istanbul algorithm:
 *  - builds a line index for the original source (with `c8 ignore` support)
 *  - remaps V8 range offsets through the source map to original positions
 *  - records one "statement" per line, one "branch" per block range and one
 *    "function" per V8 function
 *
 * Node.js >= 12 reports coverage offsets without the CJS wrapper, so no
 * wrapper-length adjustment is needed.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import is from '@magic/types'

import type { FileCoverage, Location, Position, RawSourceMap, V8ScriptCoverage } from './types.js'
import {
  decodeSourceMap,
  originalPositionTryBoth,
  originalEndPositionFor,
  type DecodedMap,
} from './sourcemap.js'

/** one line of a source file with absolute offsets */
interface CovLine {
  line: number
  start: number
  end: number
  count: number
  ignore: boolean
}

/** a source file with its line index */
class CovSource {
  lines: CovLine[] = []
  eof: number

  constructor(raw: string) {
    raw = raw.trimEnd()
    this.eof = raw.length
    this.buildLines(raw)
  }

  private buildLines(source: string) {
    let position = 0
    let ignoreCount = 0
    let ignoreAll = false
    const parts = source.split(/(?<=\r?\n)/u)
    for (let i = 0; i < parts.length; i++) {
      const lineStr = parts[i] || ''
      const line: CovLine = {
        line: i + 1,
        start: position,
        end: position + lineStr.length,
        count: 1,
        ignore: false,
      }
      // end excludes the trailing newline characters
      const m = lineStr.match(/\r?\n$/u)
      if (m && m[0]) line.end -= m[0].length

      if (ignoreCount > 0) {
        line.ignore = true
        ignoreCount--
      } else if (ignoreAll) {
        line.ignore = true
      }
      this.lines.push(line)
      position += lineStr.length

      const token = this.parseIgnore(lineStr)
      if (!token) continue
      line.ignore = true
      if (token.count !== undefined) ignoreCount = token.count
      if (token.start !== undefined || token.stop !== undefined) {
        ignoreAll = token.start === true
        ignoreCount = 0
      }
    }
  }

  /**
   * Parses the block-comment ignore tokens (the c8 / v8 / node:coverage
   * "ignore next [n]" and "ignore start" / "ignore stop" forms, see the
   * regexes below).
   */
  private parseIgnore(
    lineStr: string,
  ): { count?: number; start?: boolean; stop?: boolean } | undefined {
    const nextCount = lineStr.match(/^\W*\/\* (?:[cv]8|node:coverage) ignore next (?<count>[0-9]+)/)
    if (nextCount && nextCount.groups) return { count: Number(nextCount.groups.count) }
    if (lineStr.match(/^\W*\/\* (?:[cv]8|node:coverage) ignore next/)) return { count: 1 }
    if (lineStr.match(/\/\* ([cv]8|node:coverage) ignore next/)) return { count: 0 }

    const startStop = lineStr.match(/\/\* [cv]8 ignore (?<mode>start|stop)/)
    if (startStop && startStop.groups) {
      if (startStop.groups.mode === 'start') return { start: true }
      if (startStop.groups.mode === 'stop') return { stop: true }
    }
    const nodeStartStop = lineStr.match(/\/\* node:coverage (?<mode>enable|disable)/)
    if (nodeStartStop && nodeStartStop.groups) {
      if (nodeStartStop.groups.mode === 'disable') return { start: true }
      if (nodeStartStop.groups.mode === 'enable') return { stop: true }
    }
    return undefined
  }

  /**
   * Returns the lines that overlap the [startCol, endCol] offset range.
   * Columns are absolute offsets within the file.
   */
  sliceRange(startCol: number, endCol: number): CovLine[] {
    const lines = this.lines
    let lo = 0
    let hi = lines.length
    while (lo < hi) {
      let mid = (lo + hi) >> 1
      const l = lines[mid]!
      if (startCol >= l.end) {
        lo = mid + 1
      } else if (endCol < l.start) {
        hi = mid - 1
      } else {
        hi = mid
        while (mid >= 0 && startCol < lines[mid]!.end && endCol >= lines[mid]!.start) {
          mid--
        }
        lo = mid + 1
        break
      }
    }
    let end = hi
    while (end < lines.length && startCol < lines[end]!.end && endCol >= lines[end]!.start) {
      end++
    }
    return lines.slice(lo, end)
  }

  /** absolute offset for a 1-based line and relative column */
  relativeToOffset(line: number, relCol: number): number {
    line = Math.max(line, 1)
    const l = this.lines[line - 1]
    if (!l) return this.eof
    return Math.min(l.start + relCol, l.end)
  }
}

interface RecordedBranch {
  startLine: number
  startCol: number
  endLine: number
  endCol: number
  count: number
}

interface RecordedFunction {
  name: string
  startLine: number
  startCol: number
  endLine: number
  endCol: number
  count: number
}

/**
 * Context for one generated script: the original source(s) it maps to plus
 * the decoded source map (null when the script has no source map).
 */
interface SourceEntry {
  /** the resolved absolute original path */
  path: string
  covSource: CovSource
}

interface ScriptSources {
  /**
   * original sources, keyed by the raw source entry from the map (or by the
   * generated path when there is no map). v8-to-istanbul resolves the path
   * only for reporting; the lookup key stays the raw entry.
   */
  originals: Map<string, SourceEntry>
  /** the generated (transpiled) source, used to translate offsets to lines */
  transpiled: CovSource
  /** decoded source map, or null when the script has no source map */
  map: DecodedMap | null
}

const resolveSourcePath = (
  raw: RawSourceMap | null,
  sourcePath: string,
  generatedPath: string,
): string => {
  if (!sourcePath) return generatedPath
  if (sourcePath.startsWith('file://')) {
    try {
      return fileURLToPath(sourcePath)
    } catch {
      return sourcePath
    }
  }
  sourcePath = sourcePath.replace(/^webpack:\/\//, '')
  const sourceRoot = raw?.sourceRoot ? raw.sourceRoot.replace('file://', '') : ''
  const candidate = path.join(sourceRoot, sourcePath)
  return path.isAbsolute(candidate)
    ? candidate
    : path.resolve(path.dirname(generatedPath), candidate)
}

const loadScriptSources = (
  generatedPath: string,
  rawMap: RawSourceMap | null,
  readSource: (p: string) => string | null,
  transpiledRaw: string | null,
): ScriptSources | null => {
  const raw = transpiledRaw !== null ? transpiledRaw : readSource(generatedPath)
  if (raw === null) return null
  const transpiled = new CovSource(raw)

  if (!rawMap) {
    return {
      originals: new Map([[generatedPath, { path: generatedPath, covSource: transpiled }]]),
      transpiled,
      map: null,
    }
  }

  const map = decodeSourceMap(rawMap)
  if (!map) {
    // undecodable map: fall back to treating the generated source as original
    return {
      originals: new Map([[generatedPath, { path: generatedPath, covSource: transpiled }]]),
      transpiled,
      map: null,
    }
  }

  const originals = new Map<string, SourceEntry>()
  const sources = rawMap.sources
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i] || ''
    const origPath = resolveSourcePath(rawMap, src, generatedPath)
    const fromContent = rawMap.sourcesContent?.[i]
    const origRaw =
      fromContent !== undefined && fromContent !== null ? fromContent : readSource(origPath)
    if (origRaw === null) {
      // original source not readable: skip this source entirely
      continue
    }
    originals.set(src === '' ? generatedPath : src, {
      path: origPath,
      covSource: new CovSource(origRaw),
    })
  }
  if (originals.size === 0) {
    // no readable original: report on the generated source instead
    return {
      originals: new Map([[generatedPath, { path: generatedPath, covSource: transpiled }]]),
      transpiled,
      map: null,
    }
  }
  return { originals, transpiled, map }
}

/**
 * Converts one V8 range (in generated offsets) to original-source offsets.
 * Returns null when the range cannot be mapped. `path` is the key into
 * `script.originals` (the raw source entry, or the generated path).
 */
const remapRange = (
  script: ScriptSources,
  range: { startOffset: number; endOffset: number },
): { path: string; start: number; end: number } | null => {
  if (!script.map) {
    const key = script.originals.keys().next().value
    if (key === undefined) return null
    const only = script.originals.get(key)
    if (!only) return null
    const start = Math.max(0, range.startOffset)
    const end = Math.min(only.covSource.eof, range.endOffset)
    return { path: key, start, end }
  }

  // v8-to-istanbul slices the generated lines with an inclusive start
  // (startCol--), so a range beginning exactly at a line boundary maps from
  // the previous line. The lookup column below still uses the original offset.
  const genLines = script.transpiled.sliceRange(
    Math.max(0, range.startOffset) - 1,
    Math.min(script.transpiled.eof, range.endOffset),
  )
  if (genLines.length === 0) return null

  const firstGen = genLines[0]!
  const lastGen = genLines[genLines.length - 1]!

  const startMap = originalPositionTryBoth(
    script.map,
    firstGen.line,
    Math.max(0, range.startOffset - firstGen.start),
  )
  if (startMap.source === null || startMap.line === null) return null

  const endMap = originalEndPositionFor(script.map, lastGen.line, range.endOffset - lastGen.start)
  if (endMap.source === null || endMap.line === null) return null
  if (startMap.source !== endMap.source) return null

  const entry = script.originals.get(startMap.source)
  if (!entry) return null

  return {
    path: startMap.source,
    start: entry.covSource.relativeToOffset(startMap.line, startMap.column),
    end: entry.covSource.relativeToOffset(endMap.line, endMap.column),
  }
}

export interface ConvertOptions {
  /** raw source map data for the script (from the source-map-cache) */
  sourceMap: RawSourceMap | null
  /**
   * the generated (transpiled) source to use for line slicing. c8 rebuilds
   * it from the V8 source-map-cache `lineLengths` when present, because the
   * cached lengths describe the source as it was executed. When null or
   * undefined the file is read from disk.
   */
  transpiledSource?: string | null
  /** reads a source file, null when it cannot be read */
  readSource: (p: string) => string | null
  /** when true, files failing this check are dropped after remapping */
  excludeAfterRemap?: (p: string) => boolean
}

/**
 * Converts one V8 script coverage to a set of Istanbul file coverages
 * (one per original source file).
 */
export const convertScript = (script: V8ScriptCoverage, opts: ConvertOptions): FileCoverage[] => {
  const generatedPath = script.url.startsWith('file://')
    ? (() => {
        try {
          return fileURLToPath(script.url)
        } catch {
          return null
        }
      })()
    : path.isAbsolute(script.url)
      ? script.url
      : null
  if (!generatedPath) return []

  const sources = loadScriptSources(
    generatedPath,
    opts.sourceMap,
    opts.readSource,
    opts.transpiledSource ?? null,
  )
  if (!sources) return []

  const branches = new Map<string, RecordedBranch[]>()
  const functions = new Map<string, RecordedFunction[]>()
  let all = false

  for (const fn of script.functions) {
    const isEmpty = fn.functionName === '(empty-report)'
    for (let i = 0; i < fn.ranges.length; i++) {
      const range = fn.ranges[i]!
      // an empty report remaps [0, endOffset) like any other range (the
      // line counts are zeroed below regardless of the mapping)
      const loc = remapRange(
        sources,
        isEmpty ? { startOffset: 0, endOffset: range.endOffset } : range,
      )
      if (!loc) continue

      const entry = sources.originals.get(loc.path)
      if (!entry) continue
      const covSource = entry.covSource
      if (opts.excludeAfterRemap && opts.excludeAfterRemap(entry.path)) continue

      const lines = isEmpty ? covSource.lines : covSource.sliceRange(loc.start, loc.end)
      if (lines.length === 0) continue

      if (isEmpty) {
        all = true
        for (const line of lines) line.count = 0
      }

      const startLine = lines[0]!
      const endLine = lines[lines.length - 1]!
      // no clamping: c8 allows negative start columns when the range starts
      // in the newline gap before the first overlapped line
      const startCol = loc.start - startLine.start
      const endCol = Math.min(covSource.eof, loc.end) - endLine.start

      const reportPath = entry.path

      if (fn.isBlockCoverage) {
        const list = branches.get(reportPath) || []
        list.push({
          startLine: startLine.line,
          startCol,
          endLine: endLine.line,
          endCol,
          count: range.count,
        })
        branches.set(reportPath, list)
        if (fn.functionName && i === 0) {
          const fns = functions.get(reportPath) || []
          fns.push({
            name: fn.functionName,
            startLine: startLine.line,
            startCol,
            endLine: endLine.line,
            endCol,
            count: range.count,
          })
          functions.set(reportPath, fns)
        }
      } else if (fn.functionName) {
        const fns = functions.get(reportPath) || []
        fns.push({
          name: fn.functionName,
          startLine: startLine.line,
          startCol,
          endLine: endLine.line,
          endCol,
          count: range.count,
        })
        functions.set(reportPath, fns)
      }

      for (const line of lines) {
        if (isEmpty) continue // already zeroed above
        if (loc.start <= line.start && loc.end >= line.end && !line.ignore) {
          line.count = range.count
        }
      }
    }
  }

  const results: FileCoverage[] = []
  for (const entry of sources.originals.values()) {
    if (opts.excludeAfterRemap && opts.excludeAfterRemap(entry.path)) continue
    const fc = toIstanbul(
      entry.path,
      entry.covSource,
      branches.get(entry.path) || [],
      functions.get(entry.path) || [],
      all,
    )
    results.push(fc)
  }
  return results
}

const toIstanbul = (
  originalPath: string,
  covSource: CovSource,
  branchList: RecordedBranch[],
  fnList: RecordedFunction[],
  all: boolean,
): FileCoverage => {
  const statementMap: Record<string, Location> = {}
  const s: Record<string, number> = {}
  covSource.lines.forEach((line, index) => {
    statementMap[String(index)] = {
      start: { line: line.line, column: 0 },
      end: { line: line.line, column: line.end - line.start },
    }
    s[String(index)] = line.ignore ? 1 : line.count
  })

  const branchMap: FileCoverage['branchMap'] = {}
  const b: Record<string, number[]> = {}
  branchList.forEach((branch, index) => {
    const loc: Location = {
      start: { line: branch.startLine, column: branch.startCol },
      end: { line: branch.endLine, column: Number.isFinite(branch.endCol) ? branch.endCol : 0 },
    }
    const srcLine = covSource.lines[branch.startLine - 1]
    const ignore = srcLine === undefined ? true : srcLine.ignore
    branchMap[String(index)] = {
      type: 'branch',
      line: branch.startLine,
      loc,
      locations: [loc],
    }
    b[String(index)] = [ignore ? 1 : branch.count]
  })

  const fnMap: FileCoverage['fnMap'] = {}
  const f: Record<string, number> = {}
  fnList.forEach((fn, index) => {
    const loc: Location = {
      start: { line: fn.startLine, column: fn.startCol },
      end: { line: fn.endLine, column: Number.isFinite(fn.endCol) ? fn.endCol : 0 },
    }
    const srcLine = covSource.lines[fn.startLine - 1]
    const ignore = srcLine === undefined ? true : srcLine.ignore
    fnMap[String(index)] = { name: fn.name, decl: loc, loc, line: fn.startLine }
    f[String(index)] = ignore ? 1 : fn.count
  })

  return {
    path: originalPath,
    all,
    statementMap,
    s,
    fnMap,
    f,
    branchMap,
    b,
  }
}

/** `start.line|start.column|end.line|end.column`, istanbul's merge key */
const keyFromLoc = (loc: {
  start: { line: number; column: number }
  end: { line: number; column: number }
}): string => {
  return `${loc.start.line}|${loc.start.column}|${loc.end.line}|${loc.end.column}`
}

/**
 * The narrowest `map` item that fully contains `item` (istanbul's
 * findNearestContainer): closer before-distance wins, then closer
 * after-distance. Returns the item's key or null.
 */
const findNearestContainer = <T>(
  item: { start: { line: number; column: number }; end: { line: number; column: number } },
  map: Map<string, T>,
  getLoc: (
    x: T,
  ) => { start: { line: number; column: number }; end: { line: number; column: number } } | null,
): string | null => {
  let nearestKey: string | null = null
  let nearestDist: [number, number, number, number] | null = null
  for (const [key, mapItem] of map) {
    const mapLoc = getLoc(mapItem)
    if (!mapLoc) continue
    const distance: [number, number, number, number] = [
      item.start.line - mapLoc.start.line,
      item.start.column - mapLoc.start.column,
      mapLoc.end.line - item.end.line,
      mapLoc.end.column - item.end.column,
    ]
    if (
      distance[0] < 0 ||
      distance[2] < 0 ||
      (distance[0] === 0 && distance[1] < 0) ||
      (distance[2] === 0 && distance[3] < 0)
    ) {
      continue
    }
    if (nearestKey === null) {
      nearestKey = key
      nearestDist = distance
      continue
    }
    // istanbul quirk: the column tie-break only applies when the line
    // distance is exactly zero, not when it equals the current best's
    const closerBefore =
      distance[0] < nearestDist![0] || (distance[0] === 0 && distance[1] < nearestDist![1])
    const closerAfter =
      distance[2] < nearestDist![2] || (distance[2] === 0 && distance[3] < nearestDist![3])
    if (closerBefore || closerAfter) {
      nearestKey = key
      nearestDist = distance
    }
  }
  return nearestKey
}

type Hits = number | number[]

const addHits = <H extends Hits>(aHits: H, bHits: H): H => {
  if (is.number(aHits) && is.number(bHits)) {
    return (aHits + bHits) as H
  } else if (Array.isArray(aHits) && Array.isArray(bHits)) {
    return aHits.map((a, i) => (a || 0) + (bHits[i] || 0)) as H
  }
  return aHits
}

/**
 * istanbul-lib-coverage's mergeProp: items are keyed by location; equal keys
 * sum their hits, and an item missing on one side inherits the hits of the
 * narrowest container from the other side. The result is re-indexed in
 * order: all of a's items, then the new items from b.
 */
const mergeProp = <M, H extends Hits>(
  aHits: Record<string, H>,
  aMap: Map<string, M>,
  bHits: Record<string, H>,
  bMap: Map<string, M>,
  itemKey: (item: M) => string,
  getLoc: (
    item: M,
  ) => { start: { line: number; column: number }; end: { line: number; column: number } } | null,
): [Record<string, H>, Map<string, M>] => {
  const aItems = new Map<string, [H, M]>()
  for (const key of Object.keys(aHits)) {
    const item = aMap.get(key)
    if (item === undefined) continue
    aItems.set(itemKey(item), [aHits[key]!, item])
  }
  const bItems = new Map<string, [H, M]>()
  for (const key of Object.keys(bHits)) {
    const item = bMap.get(key)
    if (item === undefined) continue
    bItems.set(itemKey(item), [bHits[key]!, item])
  }
  const mergedItems = new Map<string, [H, M]>()
  for (const [key, aValue] of aItems) {
    let aItemHits = aValue[0]
    const aItem = aValue[1]
    const bValue = bItems.get(key)
    if (!bValue) {
      const aLoc = getLoc(aItem)
      if (aLoc) {
        const container = findNearestContainer(aLoc, bMap, getLoc)
        if (container !== null && bHits[container] !== undefined) {
          aItemHits = addHits(aItemHits, bHits[container]!)
        }
      }
    } else {
      aItemHits = addHits(aItemHits, bValue[0])
    }
    mergedItems.set(key, [aItemHits, aItem])
  }
  for (const [key, bValue] of bItems) {
    if (mergedItems.has(key)) continue
    let bItemHits = bValue[0]
    const bItem = bValue[1]
    const bLoc = getLoc(bItem)
    if (bLoc) {
      const container = findNearestContainer(bLoc, aMap, getLoc)
      if (container !== null && aHits[container] !== undefined) {
        bItemHits = addHits(bItemHits, aHits[container]!)
      }
    }
    mergedItems.set(key, [bItemHits, bItem])
  }
  const hits: Record<string, H> = {}
  const map = new Map<string, M>()
  let i = 0
  for (const [itemHits, item] of mergedItems.values()) {
    hits[String(i)] = itemHits
    map.set(String(i), item)
    i++
  }
  return [hits, map]
}

/**
 * Merges one FileCoverage into a map of FileCoverage keyed by path, using
 * istanbul-lib-coverage merge semantics (position-based matching, container
 * hit inheritance, `all` replacement).
 */
export const mergeFileCoverage = (map: Map<string, FileCoverage>, fc: FileCoverage): void => {
  const existing = map.get(fc.path)
  if (!existing) {
    map.set(fc.path, fc)
    return
  }

  // istanbul: an empty report (all=true) never overwrites real coverage
  if (fc.all === true) return
  if (existing.all === true) {
    existing.statementMap = fc.statementMap
    existing.s = fc.s
    existing.fnMap = fc.fnMap
    existing.f = fc.f
    existing.branchMap = fc.branchMap
    existing.b = fc.b
    existing.all = false
    return
  }

  const [s, statementMap] = mergeProp(
    existing.s,
    toMap(existing.statementMap),
    fc.s,
    toMap(fc.statementMap),
    (item: Location) => keyFromLoc(item),
    (item: Location) => item,
  )
  existing.s = s
  existing.statementMap = fromMap(statementMap)

  const [f, fnMap] = mergeProp(
    existing.f,
    toMap(existing.fnMap),
    fc.f,
    toMap(fc.fnMap),
    item => keyFromLoc(item.loc),
    item => item.loc,
  )
  existing.f = f
  existing.fnMap = fromMap(fnMap)

  const [b, branchMap] = mergeProp(
    existing.b,
    toMap(existing.branchMap),
    fc.b,
    toMap(fc.branchMap),
    item => keyFromLoc(item.locations[0]!),
    item => item.locations[0]!,
  )
  existing.b = b
  existing.branchMap = fromMap(branchMap)
}

const toMap = <M>(rec: Record<string, M>): Map<string, M> => {
  const m = new Map<string, M>()
  for (const k of Object.keys(rec)) m.set(k, rec[k]!)
  return m
}

const fromMap = <M>(m: Map<string, M>): Record<string, M> => {
  const rec: Record<string, M> = {}
  for (const [k, v] of m) rec[k] = v
  return rec
}
