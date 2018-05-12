import fs from 'fs'
import path from 'path'

import run from '../run'
import stats from '../stats'

const testDir = path.join(process.cwd(), 'test')

const watcher = dir => async (type, file) => {
  const tests = await import(testDir)
  console.log({ type, file, tests })
  file = file.replace('.js', '')
  stats.reset()
  if (tests[file]) {
    return run(tests[file])
  } else {
    return run(tests)
  }
}

const fsWatch = dir => fs.watch(dir, { recursive: true }, watcher(dir))

export const init = dirs => dirs.map(fsWatch)

export default init
