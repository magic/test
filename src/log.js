const { VERBOSE } = process.env

const codes = {
  reset: [0, 0],

  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  strikethrough: [9, 29],

  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  grey: [94, 39]
}

const paint = (key, ...str) => {
  const val = codes[key]
  const style = {
    open: `\u001b[${val[0]}m`,
    close: `\u001b[${val[1]}m`
  }

  return style.open + str + style.close
}

const log = (...val) => console.log(...val)

log.info = (...val) => VERBOSE && console.log(...val)

log.success = (...val) => log.info(paint("green", ...val))

log.error = (...val) => console.error(paint("red", JSON.stringify(val)))

log.pass = ({ msg, result }) =>
  VERBOSE && console.log(paint("green", "* pass:"), msg)

log.fail = ({ msg, result, expString, exp }) =>
  log(
    paint("red", "* fail:"),
    `\`${msg}\``,
    `expected: ${expString}`,
    `got: ${result} === ${exp}`
  )

log.annotate = msg => log.info(paint("grey", msg))

log.paint = paint

module.exports = log
