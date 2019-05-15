#!/usr/bin/env node

const path = require('path')
const spawn = require('@magic/cli')

const cmd = path.join(__dirname, 'format.mjs')

spawn([cmd])
