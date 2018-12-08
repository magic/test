const fs = require('fs')
const path = require('path')

const run = require('../run')
const stats = require('./stats')

const testDir = path.join(process.cwd(), 'test')
const tests = require(testDir)

const watcher = dir => (type, file) => {
  file = file.replace('.js', '')
  stats.reset()
  if (tests[file]) {
    return run(tests[file])
  } else {
    return run(tests)
  }
}

const fsWatch = dir => fs.watch(dir, { recursive: true }, watcher(dir))

const init = dirs => dirs.map(fsWatch)

module.exports = init
