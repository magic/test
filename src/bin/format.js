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
  help: `

    f -  format js code using prettier

    usage:
    magic [TASKS]...

    available tasks:
    -w --write - lint and write files
    -l --list  - only show differences *default
    -h --help  - this help text
  `,
})

const cliFile = 'prettier'
const cliPath = path.join(process.cwd(), 'node_modules', 'prettier', `bin-${cliFile}.js`)

console.log(`${cliFile} ${argv}`)
require(cliPath)
