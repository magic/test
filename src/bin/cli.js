const { promisify } = require('util')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const log = require('@magic/log')

const exec = promisify(cp.exec)

const run = async cmd => {
  console.log({ cmd })
  const { stdout, stderr } = await exec(cmd)
  if (stderr.length) {
    const errors = stderr.split('\n')
    errors.forEach(err => log.error(err))
  }

  if (stdout.length) {
    const out = stdout.split('\n')
    out.forEach(o => log.info(o))
  }
}

module.exports = run
