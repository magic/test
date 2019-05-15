#!/usr/bin/env node

import path from 'path'
import is from '@magic/types'
import deep from '@magic/deep'
import { cli } from '@magic/cli/src/index.mjs'
import log from '@magic/log'

import fso from 'fs'
import util from 'util'

const fs = {
  readdir: util.promisify(fso.readdir),
  stat: util.promisify(fso.stat),
  readFile: util.promisify(fso.readFile),
}

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
          .filter(file => !exclude.some(e => file === e || `${file}/`.startsWith(`${e}/`)))
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
  const { argv } = cli({
    options: [
      ['--write', '--w', '-w'],
      ['-l', '--list', '--list-different'],
      ['--exclude', '--e', '-e'],
      ['--file-types', '--fileTypes'],
    ],
    default: { '--list-different': [] },
    help: {
      name: '@magic/test f',
      header: 'format js code using prettier',
      example: `
  f     - only --list-different files
  f -w  - overwrite files in place`,
    },
  })

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

  const write = argv['--write']
  if (write) {
    args.push('--write')
  }

  const {
    default: { name },
  } = await import(path.join(process.cwd(), 'package.json'))

  let configPath
  if (name === '@magic/test') {
    configPath = path.join(process.cwd(), 'src', 'format', 'index.json')
  } else {
    configPath = path.join(
      process.cwd(),
      'node_modules',
      '@magic',
      'test',
      'src',
      'format',
      'index.json',
    )
  }

  args.push('--config')
  args.push(configPath)

  args = [...args, ...files]

  const res = cli.spawn(cmd, args)

  if (!write) {
    log.annotate('files that need to be prettyfied:')
  }

  res.on('exit', () => log('formatting done'))
}

init()
