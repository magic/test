import { default as generate } from 'babel-generator';
import { default as _ } from 'lodash';
import fs from 'fs';
import parser from 'babylon';

export const parseCode = source => parser.parse(source, { sourceType: 'module' })

export const readCode = filename => fs.readFileSync(filename, 'utf8')

export const isStatement = path => {
  const { type } = path
  if (!type) {
    return false
  }

  const isBlockStatement = type === 'BlockStatement'
  const typeMatch = type.indexOf('Statement') > -1 && !isBlockStatement
  const isVarDeclaration = type === 'VariableDeclaration'
  if (isBlockStatement) {
    return false
  }

  return typeMatch || isVarDeclaration
}

export const toPlainObjectRecursive = obj => {
  const res = {}
  Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'object') {
      res[key] = toPlainObjectRecursive(value)
    } else {
      res[key] = value
    }
  })
  return res
}

export const generateCode = tree => {
  const { code } = generate.default(tree, {
    comments: false
  })

  return code
}

export const toLCOV = coverageReport => {
  const report = ['SF:source.js']
  Object.entries(coverageReport.c).forEach(([statementId, counter]) => {
    const { line } = coverageReport.statementMap[statementId].start;
    report.push(`DA:${ line },${ counter }`)
  })
  report.push('end_of_record')
  return report.join('\n')
}
