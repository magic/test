// Tracks who is awaiting which shared compile promise. A watchdog interval (only
// active when MAGIC_TEST_DDL is set) periodically dumps the un-resolved waits to
// stderr so a deadlock shows the exact promise pair that never resolves.
const g = globalThis
export const ddl = msg => {
  if (process.env.MAGIC_TEST_DDL) {
    process._rawDebug(`[DDL] ${msg}`)
  }
}
export const ddlHold = (key, waiter) => {
  if (!process.env.MAGIC_TEST_DDL) {
    return
  }
  g.__DDL ??= { map: new Map() }
  const list = g.__DDL.map.get(key) ?? []
  list.push(waiter)
  g.__DDL.map.set(key, list)
}
export const ddlRelease = (key, waiter) => {
  if (!process.env.MAGIC_TEST_DDL) {
    return
  }
  const list = g.__DDL?.map.get(key)
  if (!list) {
    return
  }
  const i = list.indexOf(waiter)
  if (i >= 0) {
    list.splice(i, 1)
  }
  if (list.length === 0) {
    g.__DDL.map.delete(key)
  }
}
let watchdogStarted = false
let watchdogInterval = null
const startWatchdog = () => {
  if (watchdogStarted) {
    return
  }
  watchdogStarted = true
  const interval = setInterval(() => {
    process._rawDebug(`[DDL-hb] loop-alive`)
    if (!g.__DDL || g.__DDL.map.size === 0) {
      return
    }
    const parts = []
    for (const [key, waiters] of g.__DDL.map) {
      parts.push(`${key} <- ${waiters.join(',')}`)
    }
    process._rawDebug(`[DDL-waiting] ${parts.join(' | ')}`)
  }, 5000)
  // Debug aid only: never let the watchdog itself keep the process alive. A
  // real deadlock is kept alive by its own handles (worker/timer/socket), so
  // the unref'd interval still fires while the process is pinned.
  interval.unref()
  watchdogInterval = interval
}
const clearWatchdog = () => {
  if (watchdogInterval) {
    clearInterval(watchdogInterval)
    watchdogInterval = null
  }
  watchdogStarted = false
}
export const ddlInitWatchdog = () => {
  if (process.env.MAGIC_TEST_DDL) {
    startWatchdog()
  }
}
export const ddlClearWatchdog = () => {
  if (process.env.MAGIC_TEST_DDL) {
    clearWatchdog()
  }
}
//# sourceMappingURL=ddl.js.map
