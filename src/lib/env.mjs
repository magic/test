export const isProd = () => process.env.TEST_ENV === 'production'
export const isNodeProd = () => process.env.NODE_ENV === 'production'
export const isVerbose = () => process.env.VERBOSE

export const env = {
  isProd,
  isNodeProd,
  isVerbose,
}

export default {
  isProd,
  isNodeProd,
  isVerbose,
}
