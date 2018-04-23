const lib = (lib, spec, k) =>
  Object.entries(spec).filter(([name, fn]) => {
    if (is.array(fn)) {
      const [t, fns] = fn
      if (!t(lib[name])) {
        return false
      }

      const entries = testLib(lib[name], fns, name)
      return entries.length
    }

    const pass = fn(lib[name])
    if (!pass) {
      let err = `Missing lib function `
      if (k) {
        err = `${err}${k}.`
      }

      err = `${err}${name}`
      log.error(err)
    }
    return !pass
  })

const spec = (spec, lib, k) =>
  Object.entries(lib).filter(([name, fn]) => {
    const specKeys = Object.keys(spec)

    return specKeys.indexOf(name) === -1
  })

module.exports = {
  lib,
  spec,
}
