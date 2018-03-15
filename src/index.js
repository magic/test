const run = require('./run')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

run.run = run

module.exports = run
