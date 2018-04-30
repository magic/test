const log = require('@magic/log')

const Console = {
  cache: {
    log: [],
    warn: [],
    error: [],
  },
  log: (...args) => { this.cache.log.push(args); return args },
  warn: (...args) => { this.cache.warn.push(args); return args },
  error: (...args) => { this.cache.error.push(args); return args },
  flush: () => {
    this.cache.log.forEach(log.info)
    this.cache.warn.forEach(log.info)
    this.cache.error.forEach(log.info)
  },
}

module.export = Console
