#!/usr/bin/env node

import path from 'path'

import { name } from path.join(process.cwd(), 'package.json')

const wIndex = process.argv.indexOf('-w')
if (wIndex > -1) {
  process.argv[wIndex] = '--write'
} else {
  process.argv.push('--list-different')
}

process.argv.push('--config')

let cfPath
if (name === '@magic/test') {
  cfPath = path.join(process.cwd(), 'src', 'format', 'index.js')
} else {
  cfPath = path.join(process.cwd(), 'node_modules', '@magic', 'test', 'src', 'format', 'index.js')
}

process.argv.push(cfPath)
process.argv.push('{src,test}/**/*.js')

const cliPath = path.join(process.cwd(), 'node_modules', 'prettier', 'bin-prettier.js')
import(cliPath)
