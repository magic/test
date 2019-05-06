import env from '../env.mjs'

export const log = {
  log: () => !env.isNodeProd(),
  warn: () => !env.isNodeProd(),
  error: () => true,
  time: () => !env.isNodeProd(),
  timeEnd: () => !env.isNodeProd(),
}

export default log