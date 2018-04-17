const is = require('@magic/types')
const s = {
  suites: {},
  stats: {
    all: 0,
    pass: 0,
    fail: 0,
  },
  pkg: '',
}

s.set = (key, value) => {
  if (s[key]) {
    s[key] = Object.assign({}, s[key], value)
  }

  s[key] = value
  return s[key]
}

s.get = key => s[key]

s.add = (key, value) => {
  const data = get(key)

  Object.keys(value).forEach(k => {
    if (is.obj(data) && is.num(data[k]) && isNum(value[k])) {
      data[k] += value[k]
    }
  })

  s[key] = data

  return data
}

module.exports = s
