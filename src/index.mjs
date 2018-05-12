import runner from './run'
import logger from '@magic/log'
import types from '@magic/types'

export const run = runner
export const log = logger
export const is = types
export { isProd, isNodeProd } from './env'

export { promise } from './lib/promise'
export { store } from './store'
export { vals } from './vals'
export { curry } from './lib/curry'
// export * as version from './version'
export { mock } from './mock'

export default run
