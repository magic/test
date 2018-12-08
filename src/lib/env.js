const isNodeProd = () => process.env.NODE_ENV === 'production'
const isProd = () => process.argv.includes('-p')
const isVerbose = () => process.argv.includes('-l')

module.exports = {
  isNodeProd,
  isProd,
  isVerbose,
}
