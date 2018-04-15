const vals = require('../src/vals')

const fns = [
  { fn: () => vals, expect: v => typeof v === 'object' },
  { fn: () => vals.string, expect: v => typeof v === 'string' },
  { fn: () => vals.number, expect: v => typeof v === 'number' },
  { fn: () => vals.object, expect: v => typeof v === 'object' },
  { fn: () => vals.array, expect: Array.isArray },
]

module.exports = fns
