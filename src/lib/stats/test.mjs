import store from '../store.mjs'

const defaultStats = {
  pass: 0,
  fail: 0,
  all: 0,
  tests: [],
}

export const test = t => {
  const results = store.get('results', {})

  const { name, parent, pass, pkg } = t

  let currentName = name

  if (parent !== name) {
    currentName = `${parent}.${name}`

    results[parent] = results[parent] || { all: 0, pass: 0 }
    results[parent].all++
    if (pass) {
      results[parent].pass++
    }
  }

  if (pkg !== parent) {
    currentName = `${pkg}.${currentName}`

    results[pkg] = results[pkg] || { all: 0, pass: 0 }
    results[pkg].all++
    if (pass) {
      results[pkg].pass++
    }
  }

  results[currentName] = results[currentName] || { all: 0, pass: 0 }
  results.__PACKAGE_ROOT__ = results.__PACKAGE_ROOT__ || { all: 0, pass: 0 }

  results.__PACKAGE_ROOT__.all++
  results[currentName].all++
  if (pass) {
    results.__PACKAGE_ROOT__.pass++
    results[currentName].pass++
  }

  store.set({ results })
}
