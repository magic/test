#!/usr/bin/env node

if (process.env.NODE_ENV === 'production') {
  require('./unit')
} else {
  require('./coverage')
}
