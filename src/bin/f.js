#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const run = require('./cli')

const cliPath = path.join(process.cwd(), 'node_modules', 'prettier', 'bin-prettier.js')

const wIndex = process.argv.indexOf('-w')
if (wIndex > -1) {
  process.argv[wIndex] = '--write'
} else {
  process.argv.push('--list-different')
}

let configFile = './src/format/index.json'
if (!fs.existsSync(configFile)) {
  configFile = './node_modules/@magic/test/src/format/index.json'
}

process.argv.push('--config')
process.argv.push(configFile)
process.argv.push('{src,test}/**/*.{js,mjs}')

console.log(process.argv)
require(cliPath)
