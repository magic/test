#!/usr/bin/env node

import path from 'path'

import fs from '@magic/fs'
import cli from '@magic/cli'

const cwd = process.cwd()

const run = async () => {
  const pkgPath = path.join(cwd, 'package.json')
  const content = await fs.readFile(pkgPath)
  const { name } = JSON.parse(content)

  let binPath = path.join(cwd, 'node_modules', '@magic', 'test', 'src', 'bin')
  if (name === '@magic/test') {
    binPath = path.join(cwd, 'src', 'bin')
  }

  const binFile = path.join(binPath, 'unit.mjs')

  const isWin = process.platform === 'win32'

  let cmd = 'node'
  let argv = [binFile]

  if (!process.argv.includes('-p')) {
    let c8Cmd = 'c8'
    if (isWin) {
      c8Cmd += '.cmd'
    }
    cmd = path.join(cwd, 'node_modules', '.bin', c8Cmd)
    argv = ['--include', 'src', ...argv]
  }

  cli.exec(cmd, argv)
}

run()
