#!/usr/bin/env node

const path = require('path')
const { cli } = require('./cli')

const { name } = require(path.join(process.cwd(), 'package.json'))

let configPath
if (name === '@magic/test') {
  configPath = path.join(process.cwd(), 'src', 'format', 'index.js')
} else {
  configPath = path.join(
    process.cwd(),
    'node_modules',
    '@magic',
    'test',
    'src',
    'format',
    'index.js',
  )
}

const argv = cli({
  options: [['-w', '--w', '--write'], ['-l', '--list', '--list-different']],
  default: ['--list-different'],
  append: ['--config', configPath, '**/*.js'],
})

const cliFile = 'prettier'
const cliPath = path.join(process.cwd(), 'node_modules', 'prettier', `bin-${cliFile}.js`)

console.log(`${cliFile} ${argv}`)
require(cliPath)
