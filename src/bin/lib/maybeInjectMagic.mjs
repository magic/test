import path from 'path'

import cases from '@magic/cases'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'

const cwd = process.cwd()

export const maybeInjectMagic = async () => {
  let importRoot = path.join('@magic', 'core', 'src')

  const pkg = await fs.readFile(path.join(cwd, 'package.json'))
  const { name } = JSON.parse(pkg)
  if (name === '@magic/core') {
    importRoot = cwd + '/src'
  }

  let config
  let renderToString

  // bail early if magic is not setup
  try {
    const configFilePaths = [path.join(cwd, 'config.mjs'), path.join(cwd, 'magic.js')]

    const results = await Promise.all(configFilePaths.map(fs.exists))

    if (is.empty(results.filter(a => a))) {
      return
    }

    if (!global.CHECK_PROPS) {
      const { CHECK_PROPS } = await import('@magic/core/src/lib/CHECK_PROPS.mjs')
      global.CHECK_PROPS = CHECK_PROPS
    }

    const core = await import('@magic/core')
    renderToString = core.renderToString

    const { runConfig } = await import(`${importRoot}/config.mjs`)
    config = await runConfig({ silent: true })
  } catch (e) {
    if (e.code !== 'ERR_MODULE_NOT_FOUND') {
      log.error(e)
      return
    }
  }

  if (!renderToString) {
    log.error(
      'E_NO_INSTALL',
      'maybeInjectMagic: @magic/core import failed. please run "npm install --save-exact @magic/core".',
    )
    process.exit(1)
  }

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

    const renderString =
      fn =>
      (...args) =>
        renderToString(is.fn(fn.View) ? fn.View(...args) : fn(...args))
          .replace(/&lt;/gim, '<')
          .replace(/&gt;/gim, '>')
          .replace(/&quot;/gim, '"')

    Object.entries(modules).forEach(([key, fn]) => {
      global[key] = renderString(fn)
    })
  }
}
