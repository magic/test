const replaceArgv = args => {
  let argv
  args
    .map(arg => ({ arg, idx: process.argv.indexOf(arg) }))
    .filter(({ idx }) => idx > -1)
    .map(({ arg, idx }, id) => {
      if (id === 0) {
        argv = args[args.length - 1]
      }
    })

  return argv
}

const cli = args => {
  args.options = args.options || []
  args.default = args.default || []
  args.append = args.append || []
  args.env = args.env || []

  if (args.help && args.help.length) {
    if (['-h', '--h', '--help'].some(arg => process.argv.includes(arg))) {
      console.log(args.help)
      process.exit()
    }
  }

  let mapped = args.options.map(replaceArgv).filter(a => a)

  if (mapped.length === 0 && args.default && args.default.length > 0) {
    mapped = args.default
  }

  const append = [...mapped, ...args.append]

  process.argv = [process.argv[0], process.argv[1], ...append]

  args.env
    .filter(([argv, env]) => process.argv.includes(argv))
    .map(([argv, env, set]) => {
      process.env[env] = set
    })

  return append.join(' ')
}

module.exports = {
  cli,
  replaceArgv,
}
