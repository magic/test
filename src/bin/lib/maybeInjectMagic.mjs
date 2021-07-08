import path from 'path'

import fs from '@magic/fs'
import cases from '@magic/cases'
import { renderToString } from '@magic/core'

const cwd = process.cwd()

export const maybeInjectMagic = async () => {
  let config
  let importRoot = path.join('@magic', 'core', 'src')

  const pkg = await fs.readFile(path.join(cwd, 'package.json'))
  const { name } = JSON.parse(pkg)
  if (name === '@magic/core') {
    importRoot = cwd + '/src'
  }

  const { runConfig } = await import(`${importRoot}/config.mjs`)

  // bail early if magic is not setup
  try {
    config = await runConfig({ silent: true })
  } catch (e) {}

  if (config) {
    const { default: runApp } = await import(`${importRoot}/modules/app.mjs`)
    const { runCmd } = await import(`${importRoot}/cluster/runCmd.mjs`)

    const App = await runApp(config)
    const app = await runCmd('prepare', App, config)

    global.modules = app.modules
    global.actions = app.actions
    global.effects = app.effects
    global.lib = app.lib
    global.helpers = app.helpers
    global.subscriptions = app.subscriptions

    global.lib = Object.fromEntries(
      Object.entries(app.lib).map(([k, v]) => {
        return [cases.camel(k), `lib.${cases.camel(k)}`]
      }),
    )

    const renderString = fn => (...args) =>
      renderToString(fn(...args))
        .replace(/&lt;/gim, '<')
        .replace(/&gt;/gim, '>')
        .replace(/&quot;/gim, '"')

    Object.entries(modules).map(([key, fn]) => {
      global[key] = renderString(fn)
    })
  }
}
