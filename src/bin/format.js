#!/usr/bin/env node

const path = require('path')
const is = require('@magic/types')
const deep = require('@magic/deep')
const cli = require('./cli')

const fso = require('fs')
const util = require('util')

const prettier = require('prettier')

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

const config = require(configPath)

const fs = {
  readdir: util.promisify(fso.readdir),
  stat: util.promisify(fso.stat),
  readFile: util.promisify(fso.readFile),
}

const mapArgv = argv => {
  const arr = []

  Object.entries(argv).forEach(([key, val]) => {
    arr.push(`--${key}`)
    if (!is.empty(val)) {
      arr.push(val)
    }
  })

  return deep.flatten(arr)
}

const argv = cli({
  options: [
    ['--write', '--w', '-w'],
    ['-l', '--list', '--list-different'],
    ['--exclude', '--e', '-e'],
    ['--file-types', '--fileTypes'],
  ],
  default: { '--list-different': [] },
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
const cmd = path.join(process.cwd(), 'node_modules', 'prettier', `bin-${cliFile}.js`)

const findFiles = async ({ include, exclude, fileTypes }) => {
  const files = await Promise.all(
    include.map(async dir => {
      if (dir.startsWith('.')) {
        return
      }

      const stat = await fs.stat(dir)
      let files = []
      if (stat.isDirectory()) {
        let dirContent = await fs.readdir(dir)
        dirContent = dirContent
          .filter(file => !file.startsWith('.'))
          .filter(file => !exclude.some(e => file.startsWith(e)))
          .filter(file => !file.includes('.') || fileTypes.some(ft => file.endsWith(ft)))

        files = await Promise.all(
          dirContent.map(a => findFiles({ include: [path.join(dir, a)], exclude, fileTypes })),
        )
      } else if (stat.isFile()) {
        if (fileTypes.some(f => dir.endsWith(f))) {
          files.push(dir)
        }
      }

      return files
    }),
  )

  return deep.flatten(files)
}

const init = async () => {
  const argvKeys = Object.keys(argv)

  let include = ''
  if (argv['--include']) {
    include = argv['--include']
  } else {
    include = [process.cwd()]
  }

  const gitignore = await fs.readFile(path.join(process.cwd(), '.gitignore'), 'utf8')
  const gitignoreArray = gitignore.split('\n').filter(a => a)

  let exclude = ['node_modules', '.nyc_output', ...gitignoreArray]
  if (argv['--exclude']) {
    if (is.array(argv['--exclude'])) {
      exclude = [...exclude, ...argv['--exclude']]
    } else {
      exclude = [...exclude, argv['--exclude']]
    }
  }

  exclude = Array.from(new Set(exclude))

  let fileTypes = ['js', 'json']
  if (argv['--file-types']) {
    fileTypes = argv['--file-types']
  }

  const files = await findFiles({ include, exclude, fileTypes })

  let args = []

  const write = argv.hasOwnProperty('--write')
  if (write) {
    args.push('--write')
  }

  args.push('--list-different')

  args.push('--config')
  args.push(configPath)

  args = [...args, ...files]
  const res = cli.spawn(cmd, args)

  if (write) {
    console.log('files that were prettyfied:')
  } else {
    console.log('files that need to be prettyfied:')
  }

  res.on('exit', () => console.log('formatting done'))
}

init()
