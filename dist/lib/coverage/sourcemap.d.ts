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
import type { RawSourceMap } from './types.js'
/** a single decoded mapping segment: [genCol, srcIdx, origLine0, origCol, nameIdx?] */
export type Segment = [number, number, number, number, number?]
export declare const GREATEST_LOWER_BOUND = 1
export declare const LEAST_UPPER_BOUND = 0
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
/**
 * Decodes a source map into a form suitable for fast lookups.
 * Returns null when the mappings cannot be decoded.
 */
export declare const decodeSourceMap: (raw: RawSourceMap) => DecodedMap | null
/**
 * Maps a generated position to the original position.
 * line is 1-based, column is 0-based.
 */
export declare const originalPositionFor: (
  map: DecodedMap,
  line: number,
  column: number,
  bias: number,
) => MappedPosition
/**
 * Maps an original position to the generated position (reverse lookup).
 * Used by originalEndPositionFor.
 */
export declare const generatedPositionFor: (
  map: DecodedMap,
  sourceIndex: number,
  line: number,
  column: number,
  bias: number,
) => {
  line: number | null
  column: number
}
/**
 * originalPositionFor with the "try both biases" behavior used by
 * v8-to-istanbul (GREATEST_LOWER_BOUND first, falling back to
 * LEAST_UPPER_BOUND, plus the column-0 minimum-line tweak).
 */
export declare const originalPositionTryBoth: (
  map: DecodedMap,
  line: number,
  column: number,
) => MappedPosition
/**
 * Finds the _end_ position of the original range that corresponds to the
 * generated range ending at (line, column). Ported from
 * istanbul-lib-source-maps get-mapping.js (used by v8-to-istanbul).
 */
export declare const originalEndPositionFor: (
  map: DecodedMap,
  line: number,
  column: number,
) => {
  source: string | null
  line: number | null
  column: number
}
