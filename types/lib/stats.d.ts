export function isTestResult(obj: Suite | TestResult): obj is TestResult
export function toMinimalFixed(p: number, fix?: number): number
export function printPercent(p: number): string
export function test(t: PartialTest, store: Store): void
export function info(pkg: string, suites: (Suite | undefined | void)[], store: Store): boolean
export function reset(store: Store): void
import { Store } from './store.js'
//# sourceMappingURL=stats.d.ts.map
