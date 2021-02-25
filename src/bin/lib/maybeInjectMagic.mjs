import path from 'path'

import is from '@magic/types'
import log from '@magic/log'
import fs from '@magic/fs'

const cwd = process.cwd()

export const maybeInjectMagic = async () => {
  let config
  let importRoot = path.join('@magic', 'core', 'src')

  try {
    const pkg = await fs.readFile(path.join(cwd, 'package.json'))
    const { name } = JSON.parse(pkg)
    if (name === '@magic/core') {
      importRoot = path.join(cwd, 'src')
    }

    const { runConfig } = await import(`${importRoot}/config.mjs`)
    config = await runConfig()
  } catch (e) {
    log.error(e)
  }

  if (config) {
    const { default: runApp } = await import(`${importRoot}/modules/app.mjs`)
    const { runCmd } = await import(`${importRoot}/cluster/runCmd.mjs`)

    const App = await runApp(config)
    const app = await runCmd('prepare', App, config)

    global.modules = app.modules
    global.actions = app.actions
    global.effects = app.effects

    // Object.entries(app).map(([k, v]) => {
    //   global[k] = v
    // })

    const cleanUpAst = ast => {
      if (is.array(ast)) {
        return ast.map(cleanUpAst)
      }

      if (ast.name) {
        if (is.empty(ast.props) && is.empty(ast.children)) {
          return ast.name
        }

        const result = [ast.name]

        if (!is.empty(ast.props)) {
          result.push(ast.props)
        }

        if (!is.empty(ast.children)) {
          result.push(ast.children.map(cleanUpAst))
        }

        return result
      } else {
        return ast
      }
    }

    Object.entries(modules).map(([key, fn]) => {
      global[key] = (...args) => {
        const ast = fn(...args)

        return cleanUpAst(ast)
      }
    })
  }
}
