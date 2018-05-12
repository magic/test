const exists = t => process.argv.indexOf(t) > -1
const isProd = () => ['-p', '--prod', '--production'].some(exists)
const isNodeProd = () => process.env.NODE_ENV === 'production'
const isVerbose = () => ['-v', '--loud', '--verbose'].some(exists)

module.exports = {
  isProd,
  isNodeProd,
  isVerbose,
}
