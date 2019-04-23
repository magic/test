const { exec } = require('child_process')
const os = require('os')

const is = require('@magic/types')

const parseArgv = ({ options }) => {
  let lastArg
  const args = {}
  // map over argv, find arguments and values.
  // arguments are all strings starting with a -,
  // values are all strings between strings starting with a -.
  process.argv.forEach(arg => {
    if (arg.startsWith('-')) {
      let matchedArg
      options.forEach(option => {
        if (is.array(option)) {
          if (option.some(opt => opt === arg)) {
            matchedArg = option[0]
          }
        } else if (option === arg) {
          matchedArg = option
        }
      })
      lastArg = matchedArg
      args[lastArg] = []
    } else {
      if (lastArg) {
        args[lastArg].push(arg)
      }
    }
  })

  return args
}

const cli = args => {
  const {
    options = [],
    default: def = [],
    append = [],
    env = [],
    help = 'this cli has no help text specified. if it would, we would show it now.',
  } = args

  if (['-h', '--h', '--help'].some(arg => process.argv.includes(arg))) {
    console.log(help)
    process.exit()
  }

  // set env depending on env argv switches (-p and -d)
  env
    .filter(([argv]) => argv.some(a => process.argv.includes(a)))
    .map(([_, envName, envValue]) => {
      process.env[envName] = envValue
    })

  let matched = parseArgv({ options })

  if (!is.empty(def) && is.empty(matched)) {
    Object.entries(def).forEach(([k, v]) => {
      matched[k] = v
    })
  }
  if (!is.empty(append)) {
    Object.entries(append).forEach(([k, v]) => {
      matched[k] = v
    })
  }

  return matched
}

cli.spawn = (cmd, args = []) => {
  if (os.type() === 'Windows_NT') {
    cmd = `node ${cmd}`
  }

  const res = exec(cmd, args)

  res.stdout.pipe(process.stdout)
  res.stderr.pipe(process.stderr)

  return res
}

module.exports = cli
