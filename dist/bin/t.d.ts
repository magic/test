#!/usr/bin/env node
export interface BuildUnitCommandProps {
  isProd: boolean
  isWin: boolean
  cwd: string
  name: string
  include: string[]
  exclude: string[] | null
}
/**
 * Build the child command for the unit.js runner:
 *   prod:  node unit.js
 *   other: c8 --exclude ... --source-maps ... --include ... node unit.js
 *
 * Pure helper, exported for testing.
 */
export declare const buildUnitCommand: ({
  isProd,
  isWin,
  cwd,
  name,
  include,
  exclude,
}: BuildUnitCommandProps) => {
  cmd: string
  argv: string[]
}
declare const _default: {
  run: () => Promise<void>
  buildUnitCommand: ({ isProd, isWin, cwd, name, include, exclude }: BuildUnitCommandProps) => {
    cmd: string
    argv: string[]
  }
}
export default _default
