const run = require("./run")
const { promise } = require("./lib")

process.env.NODE_ENV = process.env.NODE_ENV || "test"

run.run = run

run.promise = promise

module.exports = run
