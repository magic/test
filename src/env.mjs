export const isProd = () => process.env.TEST_ENV === 'production'
export const isNodeProd = () => process.env.NODE_ENV === 'production'

export default {
  isProd,
  isNodeProd,
}
