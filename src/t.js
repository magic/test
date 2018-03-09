const log = require('./log')

const t = v => v === true

t.true = v => v === true,
t.false = v => v === false,
t.ok = () => true,
t.pass = () => true,
t.fail = () => false

module.exports = t
