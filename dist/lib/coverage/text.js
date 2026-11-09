/**
 * Text coverage reporter.
 *
 * A faithful port of istanbul's `text` reporter (istanbul-reports) on top of
 * the `pkg` summarizer (istanbul-lib-report): a flat list of directory nodes
 * (only the immediate parents of files) with the common parent stripped,
 * truncated percentages, and istanbul's exact uncovered-line ranges.
 */
const NAME_COL = 4
const PCT_COLS = 7
const MISSING_COL = 17
const TAB_SIZE = 1
const DELIM = ' | '
// istanbul-lib-report default watermarks
const LOW_WATERMARK = 50
const HIGH_WATERMARK = 80
const padding = (num, ch = ' ') => {
  let str = ''
  for (let i = 0; i < num; i++) str += ch
  return str
}
/** istanbul-reports fill(): left- or right-pad, truncate long names with `...` */
const fill = (str, width, right, tabs) => {
  tabs = tabs || 0
  const leadingSpaces = tabs * TAB_SIZE
  const remaining = width - leadingSpaces
  const leader = padding(leadingSpaces)
  let s = String(str)
  let fmtStr = ''
  if (remaining > 0) {
    const strlen = s.length
    let fillStr
    if (remaining >= strlen) {
      fillStr = padding(remaining - strlen)
    } else {
      fillStr = '...'
      const length = remaining - fillStr.length
      s = s.substring(strlen - length)
      right = true
    }
    fmtStr = right ? fillStr + s : s + fillStr
  }
  return leader + fmtStr
}
const formatName = (name, maxCols, level) => {
  return fill(name, maxCols, false, level)
}
const formatPct = (pct, width = PCT_COLS) => {
  return fill(String(pct), width, true, 0)
}
/** istanbul-lib-coverage percent(): truncates to 2 decimals (no rounding) */
const percent = (covered, total) => {
  if (total > 0) {
    const tmp = (1000 * 100 * covered) / total
    return Math.floor(tmp / 10) / 100
  }
  return 100
}
const emptyMetric = () => {
  return { total: 0, covered: 0, pct: 100 }
}
/** istanbul FileCoverage.getLineCoverage(): max statement count per line */
const getLineCoverage = fc => {
  const lineMap = {}
  for (const [st, count] of Object.entries(fc.s)) {
    const loc = fc.statementMap[st]
    if (!loc) continue
    const line = loc.start.line
    const prev = lineMap[line]
    if (prev === undefined || prev < count) {
      lineMap[line] = count
    }
  }
  return lineMap
}
/** istanbul FileCoverage.getBranchCoverageByLine() */
const getBranchCoverageByLine = fc => {
  const ret = {}
  for (const [k, map] of Object.entries(fc.branchMap)) {
    const line = map.line || map.loc.start.line
    const branchData = fc.b[k] || []
    ret[line] = ret[line] || []
    ret[line].push(...branchData)
  }
  const out = {}
  for (const [k, dataArray] of Object.entries(ret)) {
    const covered = dataArray.filter(item => item > 0).length
    out[Number(k)] = { coverage: (covered / dataArray.length) * 100 }
  }
  return out
}
/** istanbul FileCoverage.toSummary() */
const fileSummary = fc => {
  const simple = values => {
    const total = values.length
    const covered = values.filter(v => !!v).length
    return { total, covered, pct: percent(covered, total) }
  }
  let bTotal = 0
  let bCovered = 0
  for (const branches of Object.values(fc.b)) {
    bTotal += branches.length
    bCovered += branches.filter(hits => hits > 0).length
  }
  return {
    statements: simple(Object.values(fc.s)),
    branches: { total: bTotal, covered: bCovered, pct: percent(bCovered, bTotal) },
    functions: simple(Object.values(fc.f)),
    lines: simple(Object.values(getLineCoverage(fc))),
  }
}
const pathOf = n => n.v.join('/')
/** istanbul ReportNode.getRelativeName() */
const relativeName = n => {
  const parentPath = n.parent ? n.parent.v : []
  let isAncestor = n.v.length > parentPath.length
  for (let i = 0; i < parentPath.length && isAncestor; i++) {
    if (n.v[i] !== parentPath[i]) isAncestor = false
  }
  if (isAncestor) {
    return n.v.slice(parentPath.length).join('/')
  }
  return n.v.join('/')
}
/** istanbul text reporter depthFor(): number of ancestors */
const depthFor = n => {
  let ret = 0
  let node = n.parent
  while (node) {
    ret += 1
    node = node.parent
  }
  return ret
}
const nodeName = n => {
  return relativeName(n) || 'All files'
}
/**
 * Builds istanbul's `pkg` tree: one directory node per immediate parent of a
 * file, the common parent of all files stripped, and (when the stripped root
 * directory itself is a parent) a prefix added to every node's path so
 * directory names read like `src/bin` and `src/lib/coverage`.
 */
const buildPkgTree = files => {
  const initial = [...files.entries()].map(([filePath, fc]) => ({
    v: filePath.split('/').filter(Boolean),
    fc,
  }))
  // common prefix of every file's parent directory
  let common = initial.length > 0 ? [...initial[0].v.slice(0, -1)] : []
  for (const o of initial) {
    const p = o.v.slice(0, -1)
    const len = Math.min(common.length, p.length)
    let i = 0
    while (i < len && common[i] === p[i]) i++
    common = common.slice(0, i)
  }
  if (common.length > 0) {
    for (const o of initial) o.v.splice(0, common.length)
  }
  // toDirParents
  const nodeMap = new Map()
  for (const o of initial) {
    const parentV = o.v.slice(0, -1)
    const key = parentV.join('/')
    let parent = nodeMap.get(key)
    if (!parent) {
      parent = { v: parentV, parent: null, fileCoverage: null, children: [] }
      nodeMap.set(key, parent)
    }
    parent.children.push({ v: o.v, parent, fileCoverage: o.fc, children: [] })
  }
  const dirParents = [...nodeMap.values()]
  let root
  let childPrefix
  if (dirParents.length === 1) {
    root = dirParents[0]
  } else {
    root = { v: [], parent: null, fileCoverage: null, children: dirParents }
    for (const dp of dirParents) dp.parent = root
    if (dirParents.some(dp => dp.v.length === 0)) {
      childPrefix = common.length === 0 ? 'root' : common[common.length - 1]
    }
  }
  // ReportTree: prefix every non-root node, sort children by path string
  const walk = n => {
    if (childPrefix && n !== root) n.v.unshift(childPrefix)
    if (n.fileCoverage === null) {
      n.children.sort((a, b) => {
        const astr = pathOf(a)
        const bstr = pathOf(b)
        return astr < bstr ? -1 : astr > bstr ? 1 : 0
      })
    }
    for (const c of n.children) walk(c)
  }
  walk(root)
  return root
}
/** istanbul ReportNode.getCoverageSummary() (no filesOnly) */
const nodeSummary = n => {
  if (n.fileCoverage) {
    if (!n.summaryCache) n.summaryCache = fileSummary(n.fileCoverage)
    return n.summaryCache
  }
  if (!n.summaryCache) {
    const sum = {
      statements: emptyMetric(),
      branches: emptyMetric(),
      functions: emptyMetric(),
      lines: emptyMetric(),
    }
    for (const child of n.children) {
      const cs = nodeSummary(child)
      for (const key of ['statements', 'branches', 'functions', 'lines']) {
        const a = sum[key]
        const b = cs[key]
        a.total += b.total
        a.covered += b.covered
        a.pct = percent(a.covered, a.total)
      }
    }
    n.summaryCache = sum
  }
  return n.summaryCache
}
/** istanbul text reporter nodeMissing() */
const nodeMissing = n => {
  if (n.fileCoverage === null) return ''
  const fc = n.fileCoverage
  const linesPct = nodeSummary(n).lines.pct
  let coveredLines
  if (linesPct === 100) {
    const branches = getBranchCoverageByLine(fc)
    coveredLines = Object.entries(branches).map(([key, { coverage }]) => [
      Number(key),
      coverage === 100,
    ])
  } else {
    coveredLines = Object.entries(getLineCoverage(fc)).map(([line, count]) => [Number(line), count])
  }
  let newRange = true
  const ranges = coveredLines.reduce((acum, [line, hit]) => {
    if (hit) {
      newRange = true
    } else {
      const l = Number(line)
      if (newRange) {
        acum.push([l])
        newRange = false
      } else {
        acum[acum.length - 1][1] = l
      }
    }
    return acum
  }, [])
  return ranges
    .map(range => {
      if (range.length === 1) return range[0]
      return `${range[0]}-${range[1]}`
    })
    .join(',')
}
// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------
const classForPercent = value => {
  if (value < LOW_WATERMARK) return 'low'
  if (value >= HIGH_WATERMARK) return 'high'
  return 'medium'
}
const makeLine = (nameWidth, missingWidth) => {
  const name = padding(nameWidth, '-')
  const pct = padding(PCT_COLS, '-')
  return (
    [name, pct, padding(PCT_COLS + 1, '-'), pct, pct, padding(missingWidth, '-')].join(
      DELIM.replace(/ /g, '-'),
    ) + '-'
  )
}
const tableHeader = (maxNameCols, missingWidth) => {
  return (
    [
      formatName('File', maxNameCols, 0),
      formatPct('% Stmts'),
      formatPct('% Branch', PCT_COLS + 1),
      formatPct('% Funcs'),
      formatPct('% Lines'),
      formatName('Uncovered Line #s', missingWidth, 0),
    ].join(DELIM) + ' '
  )
}
/** istanbul-reports findWidth() */
const findWidth = (root, extractor, depthForFn) => {
  let last = 0
  const visit = n => {
    last = Math.max(last, TAB_SIZE * depthForFn(n) + extractor(n).length)
    for (const c of n.children) visit(c)
  }
  visit(root)
  return last
}
/**
 * Renders the coverage table and writes it to stdout.
 */
export const printTextReport = (files, opts = {}) => {
  void opts.cwd
  const color = opts.color ?? Boolean(process.stdout.isTTY)
  const colorize = (s, cls) => {
    if (!color) return s
    const codes = { low: '31;1', medium: '33;1', high: '32;1' }
    return `\u001b[${codes[cls]}m${s}\u001b[0m`
  }
  const maxCols = opts.maxCols ?? (process.stdout.columns || 100)
  const root = buildPkgTree(files)
  const nameWidth0 = Math.max(NAME_COL, findWidth(root, nodeName, depthFor))
  const missingWidth0 = Math.max(
    MISSING_COL,
    findWidth(root, nodeMissing, () => 0),
  )
  let nameWidth = nameWidth0
  let missingWidth = missingWidth0
  if (maxCols > 0) {
    const pctCols = DELIM.length + 4 * (PCT_COLS + DELIM.length) + 2
    let maxRemaining = maxCols - (pctCols + MISSING_COL)
    if (nameWidth > maxRemaining) {
      nameWidth = maxRemaining
      missingWidth = MISSING_COL
    } else if (nameWidth < maxRemaining) {
      maxRemaining = maxCols - (nameWidth + pctCols)
      if (missingWidth > maxRemaining) {
        missingWidth = maxRemaining
      }
    }
  }
  const out = []
  const line = makeLine(nameWidth, missingWidth)
  out.push(line)
  out.push(tableHeader(nameWidth, missingWidth))
  out.push(line)
  const formatRow = n => {
    const metrics = nodeSummary(n)
    const isEmpty = metrics.lines.total === 0
    const mm = {
      statements: isEmpty ? 0 : metrics.statements.pct,
      branches: isEmpty ? 0 : metrics.branches.pct,
      functions: isEmpty ? 0 : metrics.functions.pct,
      lines: isEmpty ? 0 : metrics.lines.pct,
    }
    const colorizeRow = (str, key) => (isEmpty ? str : colorize(str, classForPercent(mm[key])))
    const missing = nodeMissing(n)
    const elements = [
      colorizeRow(formatName(nodeName(n), nameWidth, depthFor(n)), 'statements'),
      colorizeRow(formatPct(mm.statements), 'statements'),
      colorizeRow(formatPct(mm.branches, PCT_COLS + 1), 'branches'),
      colorizeRow(formatPct(mm.functions), 'functions'),
      colorizeRow(formatPct(mm.lines), 'lines'),
      colorize(formatName(missing, missingWidth, 0), mm.lines === 100 ? 'medium' : 'low'),
    ]
    return elements.join(DELIM) + ' '
  }
  const row = n => {
    out.push(formatRow(n))
    for (const child of n.children) row(child)
  }
  row(root)
  // Repeat the "All files" summary row at the end of the table
  out.push(formatRow(root))
  out.push(makeLine(nameWidth, missingWidth))
  process.stdout.write(out.join('\n') + '\n')
}
//# sourceMappingURL=text.js.map
