const log = require('@magic/log')
const is = require('@magic/types')

const run = require('./run')
const { promise } = require('./lib')
const storage = require('./storage')
const vals = require('./vals')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

run.run = run

run.promise = promise

run.log = log

run.is = is

run.storage = storage

run.vals = vals

module.exports = run
