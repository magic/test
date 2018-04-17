const run = require('./run')
const { promise } = require('./lib')
const log = require('@magic/log')
const is = require('@magic/types')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

run.run = run

run.promise = promise

run.log = log

run.is = is

module.exports = run
