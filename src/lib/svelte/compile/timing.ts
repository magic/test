import log from '@magic/log'

// Performance trace entry
interface TraceEntry {
  name: string
  start: number
  end?: number
  duration?: number
}

// Global trace state
let traces: Map<string, TraceEntry> = new Map()
let traceEnabled = process.env.MAGIC_TEST_TRACE === '1'

// ANSI colors for trace output
const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
}

export const enableTracing = () => {
  traceEnabled = true
}

export const disableTracing = () => {
  traceEnabled = false
}

export const isTracingEnabled = () => traceEnabled

// Start a named trace
export const traceStart = (name: string): string => {
  if (!traceEnabled) return name

  const id = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  traces.set(id, {
    name,
    start: performance.now(),
  })

  const time = new Date().toISOString().split('T')[1]?.slice(0, 8) || ''
  log.info(
    `${colors.dim}[${time}]${colors.reset} ${colors.cyan}→${colors.reset} ${colors.bold}${name}${colors.reset}`,
  )

  return id
}

// End a trace and optionally log the duration
export const traceEnd = (id: string, details?: string): number | undefined => {
  if (!traceEnabled) return undefined

  const entry = traces.get(id)
  if (!entry) return undefined

  const duration = performance.now() - entry.start
  entry.end = performance.now()
  entry.duration = duration

  const time = new Date().toISOString().split('T')[1]?.slice(0, 8) || ''

  // Color based on duration
  let color = colors.green
  if (duration > 100) color = colors.yellow
  if (duration > 500) color = colors.magenta
  if (duration > 1000) color = colors.reset // Will show red if terminal supports it

  const detailStr = details ? ` ${colors.dim}(${details})${colors.reset}` : ''
  log.info(
    `${colors.dim}[${time}]${colors.reset} ${color}←${colors.reset} ${colors.dim}${entry.name}${colors.reset} ${color}${duration.toFixed(2)}ms${colors.reset}${detailStr}`,
  )

  return duration
}

// Helper for async operations with tracing
export const traceAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  details?: string,
): Promise<T> => {
  const id = traceStart(name)
  try {
    const result = await fn()
    traceEnd(id, details)
    return result
  } catch (error) {
    const duration = traceEnd(id, `ERROR: ${(error as Error).message}`)
    throw error
  }
}

// Print summary of all traces
export const printTraceSummary = () => {
  if (!traceEnabled) return

  console.log('\n' + colors.bold + '═'.repeat(60) + colors.reset)
  console.log(colors.bold + '  Compilation Timing Summary' + colors.reset)
  console.log(colors.bold + '═'.repeat(60) + colors.reset + '\n')

  // Group by name pattern
  const groups = new Map<string, { total: number; count: number; entries: TraceEntry[] }>()

  for (const entry of traces.values()) {
    // Normalize name by removing unique suffixes
    const baseName = entry.name.split(' ')[0] || entry.name
    const group = groups.get(baseName) || { total: 0, count: 0, entries: [] }
    group.total += entry.duration || 0
    group.count++
    group.entries.push(entry)
    groups.set(baseName, group)
  }

  // Sort by total time
  const sorted = [...groups.entries()].sort((a, b) => b[1].total - a[1].total)

  let totalTime = 0
  for (const [, group] of sorted) {
    totalTime += group.total
  }

  for (const [name, group] of sorted) {
    const avg = group.total / group.count
    const pct = (group.total / totalTime) * 100
    const barLen = Math.round(pct / 2)
    const bar = '█'.repeat(barLen) + '░'.repeat(50 - barLen)

    console.log(
      `  ${name.padEnd(35)} ${colors.cyan}${avg.toFixed(2).padStart(8)}ms avg${colors.reset}`,
    )
    console.log(
      `  ${colors.dim}${group.count}x  total: ${group.total.toFixed(2)}ms  ${pct.toFixed(1)}%${colors.reset}`,
    )
    console.log(`  ${colors.dim}[${bar}]${colors.reset}\n`)
  }

  console.log(colors.bold + '═'.repeat(60) + colors.reset)
  console.log(`  ${colors.green}Total compilation time: ${totalTime.toFixed(2)}ms${colors.reset}\n`)
  console.log(colors.bold + '═'.repeat(60) + colors.reset + '\n')
}

// Check if trace is enabled
export const isTraceEnabled = () => traceEnabled

// Reset all traces
export const resetTraces = () => {
  traces.clear()
}

// Get trace data for external use
export const getTraceData = () => {
  return [...traces.entries()].map(([id, entry]) => ({
    id,
    ...entry,
  }))
}

// Get grouped summary data
export const getTraceSummary = () => {
  const groups = new Map<string, { total: number; count: number; min: number; max: number }>()

  for (const entry of traces.values()) {
    const name = entry.name
    const group = groups.get(name) || { total: 0, count: 0, min: Infinity, max: -Infinity }
    const duration = entry.duration || 0
    group.total += duration
    group.count++
    group.min = Math.min(group.min, duration)
    group.max = Math.max(group.max, duration)
    groups.set(name, group)
  }

  return [...groups.entries()]
    .map(([name, stats]) => ({
      name,
      ...stats,
      avg: stats.total / stats.count,
    }))
    .sort((a, b) => b.total - a.total)
}
