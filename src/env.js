const isProd = () => ['-p', '--prod', '--production'].some(t => process.argv.indexOf(t) > -1)
const isNodeProd = () => process.env.NODE_ENV === 'production'

module.exports = {
  isProd,
  isNodeProd,
}