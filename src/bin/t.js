#!/usr/bin/env node

const a = process.argv

const ps = ['-p', '--prod', '--production']

const prod = ps.some(p => a.indexOf(p) > -1)

if (prod) {
  process.env.NODE_ENV = 'production'
}

if (process.env.NODE_ENV === 'production') {
  import('./unit')
} else {
  import('./coverage')
}
