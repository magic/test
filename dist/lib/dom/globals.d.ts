import { Document as HappyDocument, Window as HappyWindow } from 'happy-dom'
export declare const define: (
  target: Record<string | symbol, unknown>,
  key: string | symbol,
  value: unknown,
) => void
/**
 * True when the process's setTimeout global is the tracked wrapper installed
 * by initGlobals (as opposed to the raw window methods or node natives).
 * Used by the svelte mount path, which must not overwrite them — doing so
 * would silently disable timer tracking for the rest of the run (every
 * main-thread component mount hit this).
 */
export declare const hasTrackedTimerGlobals: () => boolean
export type TimerScope = {
  /**
   * Run fn with this scope as the active timer context. Timers scheduled
   * inside (including in promises and nested timer callbacks) are recorded
   * in this scope's bucket, not any outer scope's.
   */
  run: <T>(fn: () => T) => T
  /**
   * Clear every timer recorded in this bucket (via the installed
   * clearTimeout/clearInterval, so already-fired and already-cleared IDs are
   * no-ops) and return how many were cleared. Safe to call once at the
   * boundary the scope covers (test end / suite end).
   */
  end: () => number
}
export declare const beginTimerScope: () => TimerScope
/**
 * End-of-run backstop: unref (not clear) every ID still pending in the
 * process-wide registry, so the process can exit naturally. Called by the
 * CLI after the run — by then per-test/per-suite scopes have already cleared
 * what they owned; anything left here escaped scoping (module-top-level
 * schedules, timers created through replaced globals) and is no longer live
 * test work. Returns how many IDs were processed.
 */
export declare const releaseDomHandles: () => number
/** @internal test helper — how many DOM timers are currently tracked */
export declare const trackedDomTimerCount: () => number
export declare const initGlobals: () => {
  window: HappyWindow
  document: HappyDocument
}
