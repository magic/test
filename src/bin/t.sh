#!/bin/sh

echo $*

node --experimental-modules ./src/bin/unit.mjs
