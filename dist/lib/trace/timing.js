import log from '@magic/log'
import { cacheManager } from '../caches/cache.js'
// Global trace state
const traces = new Map()
let traceEnabled = process.env.TEST_TRACE === '1'
let cacheStats = { hits: 0, misses: 0, total: 0 }
// ANSI colors
const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
}
export const enableTracing = () => {
  traceEnabled = true
}
export const disableTracing = () => {
  traceEnabled = false
}
export const isTracingEnabled = () => traceEnabled
export const resetTraces = () => {
  traces.clear()
  cacheStats = { hits: 0, misses: 0, total: 0 }
}
// Extract component name from a trace name like "compileSvelteWithWrite Counter.svelte"
const extractComponent = name => {
  const parts = name.split(' ')
  // If last part looks like a filename, use it
  if (parts.length > 1) {
    const last = parts[parts.length - 1]
    if (last && (last.endsWith('.svelte') || last.endsWith('.ts') || last.endsWith('.js'))) {
      return last
    }
  }
  return undefined
}
// Start a named trace
export const traceStart = name => {
  if (!traceEnabled) {
    return name
  }
  const id = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  traces.set(id, {
    name,
    component: extractComponent(name),
    start: performance.now(),
  })
  const time = new Date().toISOString().split('T')[1]?.slice(0, 8) || ''
  log.info(`${c.dim}[${time}]${c.reset} ${c.cyan}→${c.reset} ${c.bold}${name}${c.reset}`)
  return id
}
// End a trace and optionally log the duration
export const traceEnd = (id, details) => {
  if (!traceEnabled) {
    return undefined
  }
  const entry = traces.get(id)
  if (!entry) {
    return undefined
  }
  const duration = performance.now() - entry.start
  entry.end = performance.now()
  entry.duration = duration
  entry.details = details
  // Parse cache status from details
  // Formats: "cached [memory]", "cache hit", "compiled"
  if (details?.startsWith('cached') || details === 'cache hit') {
    entry.cached = true
    const match = details.match(/\[(\w+)\]/)
    if (match) {
      entry.cacheSource = match[1]
    } else {
      entry.cacheSource = 'memory'
    }
  } else {
    entry.cached = false
  }
  const time = new Date().toISOString().split('T')[1]?.slice(0, 8) || ''
  // Color based on duration AND cache status
  let color = c.green
  if (entry.cached) {
    color = c.cyan // Cached items are less urgent
  } else if (duration > 100) {
    color = c.yellow
  }
  if (duration > 500) {
    color = c.magenta
  }
  if (duration > 1000) {
    color = c.reset
  }
  // Add cache indicator
  let cacheIndicator = ''
  if (entry.cached) {
    cacheIndicator = ` ${c.green}[HIT:${entry.cacheSource || '?'}]${c.reset}`
    cacheStats.hits++
  } else if (details?.includes('compiled')) {
    cacheIndicator = ` ${c.red}[MISS]${c.reset}`
    cacheStats.misses++
  }
  // Only count for total if this is a cacheable operation
  if (entry.cached !== undefined) {
    cacheStats.total++
  }
  log.info(
    `${c.dim}[${time}]${c.reset} ${color}←${c.reset} ${c.dim}${entry.name}${c.reset} ${color}${duration.toFixed(2)}ms${c.reset} ${cacheIndicator}`,
  )
  return duration
}
// Helper for async operations with tracing
export const traceAsync = async (name, fn, details) => {
  const id = traceStart(name)
  try {
    const result = await fn()
    traceEnd(id, details)
    return result
  } catch (error) {
    traceEnd(id, `ERROR: ${error.message}`)
    throw error
  }
}
// Get unique file names from traces
const getUniqueFiles = traces => {
  const files = new Map()
  for (const trace of traces) {
    if (trace.component) {
      files.set(trace.component, (files.get(trace.component) || 0) + 1)
    }
  }
  return files
}
// Print enhanced summary of all traces
export const printTraceSummary = () => {
  if (!traceEnabled) {
    return
  }
  // Group by operation name (base name)
  const ops = new Map()
  for (const entry of traces.values()) {
    const name = entry.name ?? 'unknown'
    const baseName = name.split(' ')[0] ?? name
    const group = ops.get(baseName) || { total: 0, count: 0, entries: [] }
    group.total += entry.duration || 0
    group.count++
    group.entries.push(entry)
    ops.set(baseName, group)
  }
  const sorted = [...ops.entries()].sort((a, b) => b[1].total - a[1].total)
  const totalTime = sorted.reduce((sum, [, g]) => sum + g.total, 0)
  console.log('\n' + c.bold + '═'.repeat(70) + c.reset)
  console.log(c.bold + '  Compilation Timing Summary' + c.reset)
  console.log(c.bold + '═'.repeat(70) + c.reset + '\n')
  // Cache stats from CacheManager
  const stats = cacheManager.getStats()
  if (stats.hits > 0 || stats.misses > 0) {
    console.log(
      `  ${c.bold}Cache:${c.reset} ${c.green}${stats.hits} hits${c.reset}, ${c.red}${stats.misses} misses${c.reset} (${stats.hitRate}% hit rate)`,
    )
    console.log()
  }
  // Operations summary
  console.log(`  ${c.bold}Operations (sorted by total time):${c.reset}\n`)
  for (const [name, group] of sorted.slice(0, 15)) {
    const avg = group.total / group.count
    const pct = (group.total / totalTime) * 100
    const barLen = Math.round(pct / 2)
    const bar = '█'.repeat(barLen) + '░'.repeat(50 - barLen)
    // Get unique files for this operation
    const uniqueFiles = getUniqueFiles(group.entries)
    const uniqueCount = uniqueFiles.size
    // Color based on avg duration
    let color = c.green
    if (avg > 50) {
      color = c.yellow
    }
    if (avg > 200) {
      color = c.magenta
    }
    if (avg > 500) {
      color = c.reset
    }
    console.log(`  ${name.padEnd(30)} ${color}${avg.toFixed(2).padStart(8)}ms avg${c.reset}`)
    console.log(
      `  ${c.dim}${group.count}x calls, ${uniqueCount} unique files, total: ${group.total.toFixed(2)}ms (${pct.toFixed(1)}%)${c.reset}`,
    )
    console.log(`  ${c.dim}[${bar}]${c.reset}`)
    // Show slowest files if there are many unique files
    if (uniqueCount > 1 && group.count > uniqueCount) {
      const slowest = [...uniqueFiles.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([file, count]) => `${file} (${count}x)`)
        .join(', ')
      console.log(`  ${c.dim}Top: ${slowest}${c.reset}`)
    }
    console.log()
  }
  // Duplicate analysis - show operations that repeat more than once
  console.log(`  ${c.bold}Duplicate Analysis (per file):${c.reset}\n`)
  const fileStats = new Map()
  for (const [_name, group] of sorted) {
    for (const entry of group.entries) {
      if (entry.component) {
        const existing = fileStats.get(entry.component) || {
          file: entry.component,
          total: 0,
          cached: 0,
          compiled: 0,
        }
        existing.total++
        if (entry.cached) {
          existing.cached++
        } else if (entry.details?.includes('compiled')) {
          existing.compiled++
        }
        fileStats.set(entry.component, existing)
      }
    }
  }
  // Filter to files with multiple compilations
  const duplicates = []
  for (const stats of fileStats.values()) {
    if (stats.total > 1) {
      duplicates.push(stats)
    }
  }
  if (duplicates.length > 0) {
    duplicates.sort((a, b) => b.total - a.total)
    for (const { file, total, cached, compiled } of duplicates.slice(0, 10)) {
      const cachedStr = cached > 0 ? ` ${c.green}${cached} cached${c.reset}` : ''
      const compiledStr = compiled > 0 ? ` ${c.red}${compiled} compiled${c.reset}` : ''
      console.log(`  ${c.yellow}${file}${c.reset}: ${total}x (${cachedStr}${compiledStr})`)
    }
  } else {
    console.log(`  ${c.green}No duplicate compilations detected ✓${c.reset}`)
  }
  console.log()
  console.log(c.bold + '═'.repeat(70) + c.reset)
  console.log(
    `  ${c.green}Total: ${totalTime.toFixed(2)}ms | ${sorted.reduce((s, [, g]) => s + g.count, 0)} operations${c.reset}`,
  )
  console.log(c.bold + '═'.repeat(70) + c.reset + '\n')
}
export const isTraceEnabled = isTracingEnabled
// Legacy export for compatibility
export const getTraceSummary = () => {
  return [...traces.values()].map(e => ({
    name: e.name,
    component: e.component,
    duration: e.duration,
    details: e.details,
    cached: e.cached,
    cacheSource: e.cacheSource,
  }))
}
export const getTraceData = () => getTraceSummary()
