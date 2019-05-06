import fs from 'fs'
import path from 'path'

import run from '../run.mjs'
import stats from './stats.mjs'

const testDir = path.join(process.cwd(), 'test')
import tests from testDir

export const watcher = dir => (type, file) => {
  file = file.replace('.js', '')
  stats.reset()
  if (tests[file]) {
    return run(tests[file])
  } else {
    return run(tests)
  }
}

export const fsWatch = dir => fs.watch(dir, { recursive: true }, watcher(dir))

export const init = dirs => dirs.map(fsWatch)

export default init
