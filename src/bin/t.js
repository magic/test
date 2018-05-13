#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const run = require('./cli')

let unitPath = path.join(process.cwd(), 'src', 'bin', 'unit.mjs')
if (!fs.existsSync(unitPath)) {
  unitPath = path.join(process.cwd(), 'node_modules', '@magic', 'test', 'src', 'bin', 'unit.mjs')
}

run(`node --experimental-modules ${unitPath}`)
