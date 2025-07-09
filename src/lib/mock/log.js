import env from '../env.js'

export const log = {
  log: () => !env.isNodeProd(),
  warn: () => !env.isNodeProd(),
  error: () => true,
  time: () => !env.isNodeProd(),
  timeEnd: () => !env.isNodeProd(),
}

export default log
