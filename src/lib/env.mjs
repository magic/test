// exporting functions instead of booleans
// to enable tests that change the env
export const isNodeProd = () => process.env.NODE_ENV === 'production'
export const isProd = () => process.argv.includes('-p')
export const isVerbose = () => process.argv.includes('-l')

export const env = {
  isNodeProd,
  isProd,
  isVerbose,
}

export default env
