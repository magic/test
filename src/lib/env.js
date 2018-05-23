const isNodeProd = () => process.env.NODE_ENV === 'production'
const isProd = () => process.argv.indexOf('-p') > -1
const isVerbose = () => process.argv.indexOf('-l') > -1

module.exports = {
  isNodeProd,
  isProd,
  isVerbose,
}
