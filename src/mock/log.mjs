import log from '@magic/log'

import { isNodeProd } from '../env'

const cons = console

export default {
  log: (...args) => (isNodeProd() && cons.log(...args)) || false,
  warn: (...args) => log.info(args),
  error: (...args) => cons.error(...args) || true,
}
