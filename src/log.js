const argv = require('argv')

const VERBOSE = argv.has('-v') || argv.has('--verbose')

let styles = {}

const codes = {
  reset: [0, 0],

  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  strikethrough: [9, 29],

  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
}

const paint = (key, ...str) => {
// Object.keys(codes).forEach(key => {
  const val = codes[key]
  const style = styles[key] = []
  style.open = `\u001b[${val[0]}m`
  style.close = `\u001b[${val[1]}m`

  return style.open + str + style.close
}

const log = (...val) => console.log(...val)

log.info = (...val) => VERBOSE && console.log(val.join(' ').substr(0, VERBOSE ? 100 : 20))

log.success = (...val) => log.info(paint('green', val.join(' ')).substr(0, VERBOSE ? 100 : 20))

log.error = (...val) => console.error(paint('red', JSON.stringify(val)).substr(0, VERBOSE ? 100 : 20))

log.pass = (msg, result, expect) => VERBOSE && console.log(paint('green', '* pass:'), `\`${msg}\``, `returned ${result}`.substr(0, VERBOSE ? 100 : 20))

log.fail = (msg, result, expect) => log(paint('red', '* fail:'), `\`${msg}\``, `expected: ${expect}`, `got: ${result}`.substr(0, VERBOSE ? 100 : 20))

log.results = suites => {
  console.log('### START TESTS ###\n')

  const suiteNames = Object.keys(suites)

  const state = {
    pass: 0,
    fail: 0,
    all: 0,
  }

  suiteNames.forEach(suiteName => {
    const suite = suites[suiteName]
    const suiteStats = {
      pass: 0,
      fail: 0,
      all: 0,
    }

    const functionNames = Object.keys(suite)

    functionNames.forEach(fName => {
      const stats = suite[fName]

      log.info(`testing function ${fName}`)

      stats.fail.forEach(f => {
        console.log({ f })
        log.fail({ val: `${f.msg.replace('() => ', '')}`, res: f.res, expected: f.expected })
      })

      stats.pass.forEach(p =>
        console.log({ p }) ||
        log.pass(`${p.msg.replace('() => ', '')}`)
      )

      const pass = stats.pass.length
      const fail = stats.fail.length
      const all = pass + fail

      stats.percent = {
        pass: !pass ? 0 : (all / pass) * 100,
        fail: !fail ? 0 : (all / fail) * 100,
      }

      stats.count = {
        pass,
        fail,
        all,
      }

      log.info(`Finished: ${paint('yellow', fName)},  Pass: ${stats.count.pass}/${stats.count.all} ${stats.percent.pass}%\n`)

      suiteStats.pass += stats.count.pass
      suiteStats.fail += stats.count.fail
      suiteStats.all += stats.count.all
    })

    suiteStats.percent = {
      pass: !suiteStats.pass ? 0 : (suiteStats.all / suiteStats.pass) * 100,
      fail: !suiteStats.fail ? 0 : (suiteStats.all / suiteStats.fail) * 100,
    }

    log.info(`Finished: ${paint('underline', suiteName)}, Pass: ${suiteStats.pass}/${suiteStats.all} ${suiteStats.percent.pass}%`)

    state.pass += suiteStats.pass
    state.fail += suiteStats.fail
    state.all += suiteStats.all
  })

  state.percent = {
    pass: !state.pass ? 0 : (state.all / state.pass) * 100,
    fail: !state.fail ? 0 : (state.all / state.fail) * 100,
  }

  log.info(`####################`)
  const passMsg = state.pass === state.all ? paint('green', state.pass) : state.pass
  const percent = state.percent.pass
  const color = percent === 100 ? 'green' : percent > 75 ? 'yellow' : 'red'
  log(`${paint(color, 'Finished')} Pass: ${passMsg}/${state.all} ${paint(color, percent)}%`)

  if (state.fail > 0) {
    const failMsg = state.fail > 0 ? paint('red', state.fail) : state.fail
    log.error(`Fail: ${failMsg}/${state.all} ${state.percent.fail}%`)
  }
  log('')
}

module.exports = log
