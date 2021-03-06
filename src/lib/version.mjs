import is from '@magic/types'
import { default as log } from '@magic/log'

export const testLib = (lib, spec, k) =>
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

export const testSpec = (spec, lib, k) =>
  Object.entries(lib).filter(([name, fn]) => {
    const specKeys = Object.keys(spec)
    if (!specKeys.includes(name)) {
      log.error('Missing spec value', name)
    }
    return !specKeys.includes(name)
  })

export const tests = {
  lib: (lib, spec) => ({
    fn: () => testLib(lib, spec),
    expect: is.len.eq(0),
  }),
  spec: (spec, lib) => ({
    fn: () => testSpec(spec, lib),
    expect: is.len.eq(0),
  }),
}

export const version = {
  lib: testLib,
  spec: testSpec,
  tests,
}

export default version
