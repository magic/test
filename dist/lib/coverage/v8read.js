/**
 * Reads the coverage-*.json files Node.js writes to NODE_V8_COVERAGE and
 * merges them into one set of script coverages.
 *
 * A faithful port of @bcoe/v8-coverage's mergeProcessCovs: scripts are
 * grouped by URL, functions by root range, and matching functions are merged
 * structurally with range trees (counts are summed over matching spans).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import is from '@magic/types'
/** ascending startOffset, then descending endOffset (pre-order) */
const compareRangeCovs = (a, b) => {
  if (a.startOffset !== b.startOffset) {
    return a.startOffset - b.startOffset
  }
  return b.endOffset - a.endOffset
}
const normalizeFunctionCov = funcCov => {
  if (funcCov.ranges.length === 0) return
  funcCov.ranges.sort(compareRangeCovs)
  const tree = RangeTree.fromSortedRanges(funcCov.ranges)
  tree.normalize()
  funcCov.ranges = tree.toRanges()
}
const normalizeScriptCov = scriptCov => {
  scriptCov.functions.sort((a, b) => {
    const aRoot = a.ranges[0] ?? { startOffset: -1, endOffset: -1, count: 0 }
    const bRoot = b.ranges[0] ?? { startOffset: -1, endOffset: -1, count: 0 }
    return compareRangeCovs(aRoot, bRoot)
  })
}
const deepNormalizeScriptCov = scriptCov => {
  for (const funcCov of scriptCov.functions) {
    normalizeFunctionCov(funcCov)
  }
  normalizeScriptCov(scriptCov)
}
/**
 * A tree of ranges where `delta` is the count difference to the parent
 * (count = parentCount + delta). Ranges of a single function form a proper
 * nesting tree.
 */
class RangeTree {
  start
  end
  delta
  children = []
  constructor(start, end, delta, children) {
    this.start = start
    this.end = end
    this.delta = delta
    this.children = children
  }
  /** @precondition `ranges` are well-formed and pre-order sorted */
  static fromSortedRanges(ranges) {
    let root
    // Stack of parent trees and parent counts.
    const stack = []
    for (const range of ranges) {
      const node = new RangeTree(range.startOffset, range.endOffset, range.count, [])
      if (root === undefined) {
        root = node
        stack.push([node, range.count])
        continue
      }
      let parent
      let parentCount
      for (;;) {
        ;[parent, parentCount] = stack[stack.length - 1]
        // assert: `top !== undefined` (the ranges are sorted)
        if (range.startOffset < parent.end) {
          break
        } else {
          stack.pop()
          if (stack.length === 0) {
            break
          }
        }
      }
      node.delta -= parentCount
      parent.children.push(node)
      stack.push([node, range.count])
    }
    return root
  }
  normalize() {
    const children = []
    let curEnd = 0
    let head
    const tail = []
    const endChain = () => {
      if (tail.length !== 0) {
        head.end = tail[tail.length - 1].end
        for (const tailTree of tail) {
          for (const subChild of tailTree.children) {
            subChild.delta += tailTree.delta - head.delta
            head.children.push(subChild)
          }
        }
        tail.length = 0
      }
      head.normalize()
      children.push(head)
    }
    for (const child of this.children) {
      if (head === undefined) {
        head = child
      } else if (child.delta === head.delta && child.start === curEnd) {
        tail.push(child)
      } else {
        endChain()
        head = child
      }
      curEnd = child.end
    }
    if (head !== undefined) {
      endChain()
    }
    if (children.length === 1) {
      const child = children[0]
      if (child.start === this.start && child.end === this.end) {
        this.delta += child.delta
        this.children = child.children
        // `.lazyCount` is zero for both (both are after normalization)
        return
      }
    }
    this.children = children
  }
  /**
   * Splits this tree at `value` into the left part (this) and the right part
   * (returned).
   * @precondition `tree.start < value && value < tree.end`
   * @return RangeTree Right part
   */
  split(value) {
    let leftChildLen = this.children.length
    let mid
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      if (child.start < value && value < child.end) {
        mid = child.split(value)
        leftChildLen = i + 1
        break
      } else if (child.start >= value) {
        leftChildLen = i
        break
      }
    }
    const rightLen = this.children.length - leftChildLen
    const rightChildren = this.children.splice(leftChildLen, rightLen)
    if (mid !== undefined) {
      rightChildren.unshift(mid)
    }
    const result = new RangeTree(value, this.end, this.delta, rightChildren)
    this.end = value
    return result
  }
  /** The range coverages of the tree, pre-order sorted. */
  toRanges() {
    const ranges = []
    // Stack of parent trees and counts.
    const stack = [[this, 0]]
    while (stack.length > 0) {
      const [cur, parentCount] = stack.pop()
      const count = parentCount + cur.delta
      ranges.push({ startOffset: cur.start, endOffset: cur.end, count })
      for (let i = cur.children.length - 1; i >= 0; i--) {
        stack.push([cur.children[i], count])
      }
    }
    return ranges
  }
}
/**
 * Returns a string representation of the root range of the function.
 * Functions with the same root range are considered matching across runs.
 */
const stringifyFunctionRootRange = funcCov => {
  const rootRange = funcCov.ranges[0]
  if (!rootRange) return '\0\0'
  return `${rootRange.startOffset.toString(10)};${rootRange.endOffset.toString(10)}`
}
/**
 * Merges matching function coverages (same root range span) by merging their
 * range trees: deltas are summed, children are matched by start offset and
 * split at shared boundaries.
 */
const mergeFunctionCovs = funcCovs => {
  if (funcCovs.length === 0) {
    return undefined
  } else if (funcCovs.length === 1) {
    const merged = funcCovs[0]
    normalizeFunctionCov(merged)
    return merged
  }
  const functionName = funcCovs[0].functionName
  const trees = []
  for (const funcCov of funcCovs) {
    // assert: `fn.ranges.length > 0`
    // assert: `fn.ranges` is sorted
    trees.push(RangeTree.fromSortedRanges(funcCov.ranges))
  }
  // assert: `trees.length > 0`
  const mergedTree = mergeRangeTrees(trees)
  mergedTree.normalize()
  const ranges = mergedTree.toRanges()
  const isBlockCoverage = !(ranges.length === 1 && ranges[0].count === 0)
  const merged = { functionName, ranges, isBlockCoverage }
  // assert: `merged` is normalized
  return merged
}
/**
 * @precondition Same `start` and `end` for all the trees
 */
const mergeRangeTrees = trees => {
  if (trees.length <= 1) {
    return trees[0]
  }
  const first = trees[0]
  let delta = 0
  for (const tree of trees) {
    delta += tree.delta
  }
  const children = mergeRangeTreeChildren(trees)
  return new RangeTree(first.start, first.end, delta, children)
}
class RangeTreeWithParent {
  parentIndex
  tree
  constructor(parentIndex, tree) {
    this.parentIndex = parentIndex
    this.tree = tree
  }
}
class StartEvent {
  offset
  trees
  constructor(offset, trees) {
    this.offset = offset
    this.trees = trees
  }
  static compare(a, b) {
    return a.offset - b.offset
  }
}
class StartEventQueue {
  queue
  nextIndex = 0
  pendingOffset = 0
  pendingTrees
  constructor(queue) {
    this.queue = queue
  }
  static fromParentTrees(parentTrees) {
    const startToTrees = new Map()
    for (const [parentIndex, parentTree] of parentTrees.entries()) {
      for (const child of parentTree.children) {
        let trees = startToTrees.get(child.start)
        if (trees === undefined) {
          trees = []
          startToTrees.set(child.start, trees)
        }
        trees.push(new RangeTreeWithParent(parentIndex, child))
      }
    }
    const queue = []
    for (const [startOffset, trees] of startToTrees) {
      queue.push(new StartEvent(startOffset, trees))
    }
    queue.sort(StartEvent.compare)
    return new StartEventQueue(queue)
  }
  setPendingOffset(offset) {
    this.pendingOffset = offset
  }
  pushPendingTree(tree) {
    if (this.pendingTrees === undefined) {
      this.pendingTrees = []
    }
    this.pendingTrees.push(tree)
  }
  next() {
    const pendingTrees = this.pendingTrees
    const nextEvent = this.queue[this.nextIndex]
    if (pendingTrees === undefined) {
      this.nextIndex++
      return nextEvent
    } else if (nextEvent === undefined) {
      this.pendingTrees = undefined
      return new StartEvent(this.pendingOffset, pendingTrees)
    } else {
      if (this.pendingOffset < nextEvent.offset) {
        this.pendingTrees = undefined
        return new StartEvent(this.pendingOffset, pendingTrees)
      } else {
        if (this.pendingOffset === nextEvent.offset) {
          this.pendingTrees = undefined
          for (const tree of pendingTrees) {
            nextEvent.trees.push(tree)
          }
        }
        this.nextIndex++
        return nextEvent
      }
    }
  }
}
const mergeRangeTreeChildren = parentTrees => {
  const result = []
  const startEventQueue = StartEventQueue.fromParentTrees(parentTrees)
  const parentToNested = new Map()
  let openRange
  for (;;) {
    const event = startEventQueue.next()
    if (event === undefined) {
      break
    }
    if (openRange !== undefined && openRange.end <= event.offset) {
      result.push(nextChild(openRange, parentToNested))
      openRange = undefined
    }
    if (openRange === undefined) {
      let openRangeEnd = event.offset + 1
      for (const { parentIndex, tree } of event.trees) {
        openRangeEnd = Math.max(openRangeEnd, tree.end)
        insertChild(parentToNested, parentIndex, tree)
      }
      startEventQueue.setPendingOffset(openRangeEnd)
      openRange = { start: event.offset, end: openRangeEnd }
    } else {
      for (const { parentIndex, tree } of event.trees) {
        if (tree.end > openRange.end) {
          const right = tree.split(openRange.end)
          startEventQueue.pushPendingTree(new RangeTreeWithParent(parentIndex, right))
        }
        insertChild(parentToNested, parentIndex, tree)
      }
    }
  }
  if (openRange !== undefined) {
    result.push(nextChild(openRange, parentToNested))
  }
  return result
}
const insertChild = (parentToNested, parentIndex, tree) => {
  let nested = parentToNested.get(parentIndex)
  if (nested === undefined) {
    nested = []
    parentToNested.set(parentIndex, nested)
  }
  nested.push(tree)
}
const nextChild = (openRange, parentToNested) => {
  const matchingTrees = []
  for (const nested of parentToNested.values()) {
    if (
      nested.length === 1 &&
      nested[0].start === openRange.start &&
      nested[0].end === openRange.end
    ) {
      matchingTrees.push(nested[0])
    } else {
      matchingTrees.push(new RangeTree(openRange.start, openRange.end, 0, nested))
    }
  }
  parentToNested.clear()
  return mergeRangeTrees(matchingTrees)
}
/**
 * Merges matching script coverages (same url) across processes.
 * Functions are matched by root range; block-level granularity wins over
 * function-level granularity.
 */
const mergeScriptCovs = scriptCovs => {
  if (scriptCovs.length === 0) {
    return undefined
  } else if (scriptCovs.length === 1) {
    const merged = scriptCovs[0]
    deepNormalizeScriptCov(merged)
    return merged
  }
  const first = scriptCovs[0]
  const scriptId = first.scriptId
  const url = first.url
  const rangeToFuncs = new Map()
  for (const scriptCov of scriptCovs) {
    for (const funcCov of scriptCov.functions) {
      const rootRange = stringifyFunctionRootRange(funcCov)
      let funcCovs = rangeToFuncs.get(rootRange)
      if (
        funcCovs === undefined ||
        // if the entry in rangeToFuncs is function-level granularity and
        // the new coverage is block-level, prefer block-level.
        (!funcCovs[0].isBlockCoverage && funcCov.isBlockCoverage)
      ) {
        funcCovs = []
        rangeToFuncs.set(rootRange, funcCovs)
      } else if (funcCovs[0].isBlockCoverage && !funcCov.isBlockCoverage) {
        // if the entry in rangeToFuncs is block-level granularity, we should
        // not append function level granularity.
        continue
      }
      funcCovs.push(funcCov)
    }
  }
  const functions = []
  for (const funcCovs of rangeToFuncs.values()) {
    const merged = mergeFunctionCovs(funcCovs)
    if (merged) functions.push(merged)
  }
  const merged = { scriptId, url, functions }
  normalizeScriptCov(merged)
  return merged
}
/**
 * Loads all V8 coverage files in a directory and merges them the same way
 * c8 does (mergeProcessCovs over every file).
 *
 * - file:// urls are converted to absolute paths (c8's _normalizeProcessCov)
 * - scripts with non-absolute urls are dropped (c8's omitRelative)
 * - the source-map cache is re-keyed by absolute script path
 * - unreadable or malformed files are skipped
 */
export const loadCoverage = async tempDir => {
  const sourceMapCache = {}
  const coveredPaths = new Set()
  const byUrl = new Map()
  let entries
  try {
    entries = await fs.promises.readdir(tempDir)
  } catch {
    return { scripts: [], sourceMapCache, coveredPaths }
  }
  for (const file of entries) {
    if (!file.endsWith('.json')) continue
    let json
    try {
      json = JSON.parse(await fs.promises.readFile(path.join(tempDir, file), 'utf8'))
    } catch {
      continue
    }
    if (!is.object(json)) continue
    const proc = json
    if (!is.array(proc.result)) continue
    const cache = proc['source-map-cache']
    if (is.object(cache)) {
      for (const [k, v] of Object.entries(cache)) {
        if (!is.object(v) || !v.data) continue
        let key = k
        if (key.startsWith('file://')) {
          try {
            key = fileURLToPath(key)
          } catch {
            continue
          }
        }
        sourceMapCache[key] = v
      }
    }
    for (const script of proc.result) {
      if (!script || !is.string(script.url)) continue
      if (!script.url.startsWith('file://')) continue
      let url
      try {
        url = fileURLToPath(script.url)
      } catch {
        continue
      }
      if (!path.isAbsolute(url)) continue
      coveredPaths.add(url)
      const list = byUrl.get(url)
      if (list) {
        list.push({ ...script, url })
      } else {
        byUrl.set(url, [{ ...script, url }])
      }
    }
  }
  const scripts = []
  for (const covs of byUrl.values()) {
    const merged = mergeScriptCovs(covs)
    if (merged) scripts.push(merged)
  }
  // c8 sorts the merged result alphabetically by url
  scripts.sort((a, b) => (a.url === b.url ? 0 : a.url < b.url ? -1 : 1))
  return { scripts, sourceMapCache, coveredPaths }
}
//# sourceMappingURL=v8read.js.map
