import runner from './run'
import logger from '@magic/log'
export { default as is } from '@magic/types'

export const run = runner
export const log = logger
export { env, promise, store, vals, curry, mock, tryCatch } from './lib'

export default run
