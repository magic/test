import babelTraverse from 'babel-traverse'
import babelTypes from 'babel-types'
import template from 'babel-template'

import {
    readCode,
    parseCode,
    isStatement,
    toPlainObjectRecursive,
    generateCode
} from './utils';

let statementCounter = 0;
const coverage = {};


let logged = false

const onEachPath = path => {
  if (isStatement(path)) {
    // console.log({ path })
    const statementId = ++statementCounter
    coverage.c = coverage.c || {}
    coverage.c[statementId] = 0
    coverage.statementMap = coverage.statementMap || {}
    coverage.statementMap[statementId] = toPlainObjectRecursive(path.node.loc)
    if (typeof path.insertBefore === 'function') {
      // console.log({ par: path.parent.type, type: path })
      try {
        path.insertBefore(template(`
          __coverage__.c["${ statementId }"]++
        `)())
      } catch(e) {
        if (logged === false) {
          console.log(path)
          logged = true
        }
      }
    }
  }
}

const onExitProgram = path => {
  path.node.body.unshift(template(`
    __coverage__ = COVERAGE
  `)({
    'COVERAGE': babelTypes.valueToNode(coverage)
  }));
};


export const traverse = tree => {
  babelTraverse.default(tree, {
    enter: path => {
      if (!path.node.loc) {
        return
      }

      return onEachPath(path)
    },

    exit: path => {
      if (path.type === 'Program') {
        onExitProgram(path)
      }
    }
  })
}

export const instrument = source => {
  // const source = readCode(filename)
  const tree = parseCode(source)
  traverse(tree)
  return generateCode(tree)
}

export default instrument
