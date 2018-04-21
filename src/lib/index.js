const cleanFunctionString = require('./cleanFunctionString')
const promise = require('./promise')
const curry = require('./curry')

module.exports = {
  cleanFunctionString,
  promise,
  curry,
  cleanError: require('./cleanError')
}
