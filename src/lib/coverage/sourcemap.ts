/**
 * Minimal source-map (version 3) decoder.
 *
 * Replaces the @jridgewell/trace-mapping + convert-source-map pieces that
 * v8-to-istanbul needs: decode the VLQ `mappings` string and answer
 * "which original position does this generated position map to?".
 *
 * Position conventions match the source-map spec:
 *  - generated/original lines are 1-based when exposed by the API
 *  - columns are 0-based
 */

import is from '@magic/types'

import type { RawSourceMap } from './types.js'

/** a single decoded mapping segment: [genCol, srcIdx, origLine0, origCol, nameIdx?] */
export type Segment = [number, number, number, number, number?]

const BASE64: Record<string, number> = {}
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (let i = 0; i < ALPHABET.length; i++) BASE64[ALPHABET.charAt(i)] = i

export const GREATEST_LOWER_BOUND = 1
export const LEAST_UPPER_BOUND = 0

export interface MappedPosition {
  source: string | null
  /** 1-based original line */
  line: number | null
  /** 0-based original column */
  column: number
  name: string | null
}

export interface DecodedMap {
  sources: string[]
  sourceRoot: string
  /** segments per generated line (0-based index), sorted by generated column */
  perLine: Segment[][] | null
  /** reverse index: (srcIdx, origLine0) -> entries [origCol, genLine0, genCol] sorted by origCol */
  reverse: Map<string, [number, number, number][]>
}

const decodeVLQ = (str: string, i: number): [number, number] => {
  let result = 0
  let shift = 0
  let byte = 0
  let continuation = 0
  do {
    if (i >= str.length) return [0, i]
    byte = BASE64[str.charAt(i)] || 0
    i++
    continuation = byte & 32
    byte &= 31
    result |= byte << shift
    shift += 5
  } while (continuation)
  const negative = (result & 1) === 1
  result >>= 1
  if (negative) result = -result
  return [result, i]
}

/**
 * Decodes a source map into a form suitable for fast lookups.
 * Returns null when the mappings cannot be decoded.
 */
export const decodeSourceMap = (raw: RawSourceMap): DecodedMap | null => {
  if (!raw || !is.string(raw.mappings)) return null
  const sources = raw.sources || []
  const sourceRoot = (raw.sourceRoot || '').replace(/\/$/, '')
  const perLine: Segment[][] = []
  const reverse = new Map<string, [number, number, number][]>()
  const mappings = raw.mappings

  if (mappings.length === 0) {
    return { sources, sourceRoot, perLine: null, reverse }
  }

  let srcIdx = 0
  let origLine = 0
  let origCol = 0
  let nameIdx = 0

  const lines = mappings.split(';')
  for (let genLine = 0; genLine < lines.length; genLine++) {
    const line = lines[genLine] || ''
    const segments: Segment[] = []
    let genCol = 0
    let i = 0
    while (i < line.length) {
      const [dGenCol, i0] = decodeVLQ(line, i)
      genCol += dGenCol
      i = i0
      // A segment's fields 2-4 are deltas applied to the running state and
      // are present exactly when the next character is not the segment
      // separator (field 5 when the same holds after field 4). The segment
      // records the _new_ state, so the deltas must be applied first.
      let seg: Segment
      if (i < line.length && line.charAt(i) !== ',') {
        const [dSrc, i1] = decodeVLQ(line, i)
        srcIdx += dSrc
        i = i1
        const [dLine, i2] = decodeVLQ(line, i)
        origLine += dLine
        i = i2
        const [dCol, i3] = decodeVLQ(line, i)
        origCol += dCol
        i = i3
        if (i < line.length && line.charAt(i) !== ',') {
          const [dName, i4] = decodeVLQ(line, i)
          nameIdx += dName
          i = i4
          seg = [genCol, srcIdx, origLine, origCol, nameIdx]
        } else {
          seg = [genCol, srcIdx, origLine, origCol]
        }
      } else {
        seg = [genCol, srcIdx, origLine, origCol]
      }
      segments.push(seg)
      if (i < line.length) i++ // skip ','
    }
    perLine.push(segments)
  }

  // build the reverse index (original -> generated) used by
  // originalEndPositionFor to extend branch end positions.
  for (let genLine = 0; genLine < perLine.length; genLine++) {
    for (const seg of perLine[genLine] || []) {
      const [genCol, srcIdx, origLine, origCol] = seg
      const key = srcIdx + ':' + origLine
      const list = reverse.get(key)
      if (list) {
        list.push([origCol, genLine, genCol])
      } else {
        reverse.set(key, [[origCol, genLine, genCol]])
      }
    }
  }
  for (const list of reverse.values()) {
    list.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
  }

  return { sources, sourceRoot, perLine, reverse }
}

/**
 * Maps a generated position to the original position.
 * line is 1-based, column is 0-based.
 */
export const originalPositionFor = (
  map: DecodedMap,
  line: number,
  column: number,
  bias: number,
): MappedPosition => {
  const perLine = map.perLine
  if (!perLine) return { source: null, line: null, column: 0, name: null }
  const segments = perLine[line - 1]
  if (!segments || segments.length === 0) {
    return { source: null, line: null, column: 0, name: null }
  }

  let found: Segment | null = null
  if (bias === GREATEST_LOWER_BOUND) {
    // last segment with genCol <= column
    let lo = 0
    let hi = segments.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (segments[mid]![0] <= column) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    if (lo > 0) found = segments[lo - 1] ?? null
  } else {
    // least upper bound: the exact segment (last duplicate) or the first
    // segment with genCol > column
    let lo = 0
    let hi = segments.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (segments[mid]![0] < column) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    if (lo < segments.length) {
      if (segments[lo]![0] === column) {
        let last = lo
        while (last + 1 < segments.length && segments[last + 1]![0] === column) last++
        found = segments[last] ?? null
      } else {
        found = segments[lo] ?? null
      }
    }
  }

  if (!found) return { source: null, line: null, column: 0, name: null }
  const [/* genCol */, srcIdx, origLine, origCol] = found
  const sources = map.sources
  const source = srcIdx < sources.length ? (sources[srcIdx] ?? null) : null
  return {
    source,
    line: origLine + 1,
    column: origCol,
    name: null,
  }
}

/**
 * Maps an original position to the generated position (reverse lookup).
 * Used by originalEndPositionFor.
 */
export const generatedPositionFor = (
  map: DecodedMap,
  sourceIndex: number,
  line: number,
  column: number,
  bias: number,
): { line: number | null; column: number } => {
  const list = map.reverse.get(sourceIndex + ':' + (line - 1))
  if (!list) return { line: null, column: 0 }
  let found: [number, number, number] | null = null
  if (bias === LEAST_UPPER_BOUND) {
    let lo = 0
    let hi = list.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (list[mid]![0] >= column) {
        hi = mid
      } else {
        lo = mid + 1
      }
    }
    if (lo < list.length) found = list[lo] ?? null
  } else {
    let lo = 0
    let hi = list.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (list[mid]![0] <= column) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    if (lo > 0) found = list[lo - 1] ?? null
  }
  if (!found) return { line: null, column: 0 }
  return { line: found[1] + 1, column: found[2] }
}

/**
 * originalPositionFor with the "try both biases" behavior used by
 * v8-to-istanbul (GREATEST_LOWER_BOUND first, falling back to
 * LEAST_UPPER_BOUND, plus the column-0 minimum-line tweak).
 */
export const originalPositionTryBoth = (
  map: DecodedMap,
  line: number,
  column: number,
): MappedPosition => {
  let original = originalPositionFor(map, line, column, GREATEST_LOWER_BOUND)
  if (original.line === null) {
    original = originalPositionFor(map, line, column, LEAST_UPPER_BOUND)
  }
  if (original.line === null) return original

  // Source maps generated with @babel/core 7.7.5 map mid-line positions to an
  // earlier line than position 0 of the same line; using the line at position
  // 0 provides better reports.
  const min = originalPositionFor(map, line, 0, GREATEST_LOWER_BOUND)
  if (min.line !== null && min.line > original.line) {
    original = min
  }
  return original
}

/**
 * Finds the _end_ position of the original range that corresponds to the
 * generated range ending at (line, column). Ported from
 * istanbul-lib-source-maps get-mapping.js (used by v8-to-istanbul).
 */
export const originalEndPositionFor = (
  map: DecodedMap,
  line: number,
  column: number,
): { source: string | null; line: number | null; column: number } => {
  const beforeEndMapping = originalPositionTryBoth(map, line, Math.max(column - 1, 1))

  if (beforeEndMapping.source === null || beforeEndMapping.line === null) {
    return { source: null, line: null, column: 0 }
  }

  // find the source index for the before-end source
  const sources = map.sources
  const sourceIndex = sources.indexOf(beforeEndMapping.source)
  if (sourceIndex === -1) {
    return {
      source: beforeEndMapping.source,
      line: beforeEndMapping.line,
      column: beforeEndMapping.column,
    }
  }

  // bump right and search with a rightward bias to find the mapping right
  // after beforeEndMapping
  const afterEndMapping = generatedPositionFor(
    map,
    sourceIndex,
    beforeEndMapping.line,
    beforeEndMapping.column + 1,
    LEAST_UPPER_BOUND,
  )

  if (
    afterEndMapping.line === null ||
    originalPositionFor(map, afterEndMapping.line, afterEndMapping.column, GREATEST_LOWER_BOUND)
      .line !== beforeEndMapping.line
  ) {
    return { source: beforeEndMapping.source, line: beforeEndMapping.line, column: Infinity }
  }

  const result = originalPositionFor(
    map,
    afterEndMapping.line,
    afterEndMapping.column,
    GREATEST_LOWER_BOUND,
  )
  return { source: result.source, line: result.line, column: result.column }
}
