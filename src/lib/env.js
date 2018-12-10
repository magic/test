// exporting functions instead of booleans
// to enable tests that change the env
module.exports = {
  isNodeProd: () => process.env.NODE_ENV === 'production',
  isProd: () => process.argv.includes('-p'),
  isVerbose: () => process.argv.includes('-l'),
}
