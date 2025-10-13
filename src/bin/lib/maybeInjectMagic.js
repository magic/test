import path from 'node:path'

import cases from '@magic/cases'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'

const cwd = process.cwd()

// ✅ helper to normalize Windows paths for dynamic imports
const toImportPath = p => p.split(path.sep).join('/')

/**
 * @typedef {(...args: unknown[]) => unknown[] | { View?: (...args: unknown[]) => unknown }} ModuleFn
 */

export const maybeInjectMagic = async () => {
  let importRoot = path.join('@magic', 'core', 'src')

  const pkg = await fs.readFile(path.join(cwd, 'package.json'), 'utf-8')
  const { name } = JSON.parse(pkg)
  let isRooted = false
  if (name === '@magic/core') {
    importRoot = cwd + '/src'
    isRooted = true
  }

  let config
  /** @type {((view: unknown) => string) | undefined} */
  let renderToString

  // bail early if magic is not setup
  try {
    const configFilePaths = [path.join(cwd, 'config.mjs'), path.join(cwd, 'magic.js')]

    const results = await Promise.all(configFilePaths.map(fs.exists))

    if (is.empty(results.filter(a => a))) {
      return
    }

    if (!globalThis.CHECK_PROPS) {
      const checkPropPath = toImportPath(path.join(importRoot, 'lib', 'CHECK_PROPS.mjs'))
      const checkPropsModule = await import(checkPropPath)
      if ('CHECK_PROPS' in checkPropsModule) {
        globalThis.CHECK_PROPS = checkPropsModule.CHECK_PROPS
      }
    }

    const magicPath = isRooted ? toImportPath(path.join(importRoot, 'index.mjs')) : '@magic/core'

    const core = await import(magicPath)
    if ('renderToString' in core && is.fn(core.renderToString)) {
      renderToString = /** @type {(view: unknown) => string} */ (core.renderToString)
    }

    const configModule = await import(toImportPath(path.join(importRoot, 'config.mjs')))
    if ('runConfig' in configModule && is.fn(configModule.runConfig)) {
      config = await configModule.runConfig({ silent: true })
    }
  } catch (e) {
    const err = /** @type {import('@magic/error').CustomError} */ (e)
    if (err.code !== 'ERR_MODULE_NOT_FOUND') {
      log.error(err)
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
    const runAppModule = await import(toImportPath(path.join(importRoot, 'modules/app.mjs')))
    const runCmdModule = await import(toImportPath(path.join(importRoot, 'cluster/runCmd.mjs')))

    if (!('default' in runAppModule) || !is.fn(runAppModule.default)) {
      log.error('E_IMPORT', 'Failed to import runApp from modules/app.mjs')
      return
    }

    if (!('runCmd' in runCmdModule) || !is.fn(runCmdModule.runCmd)) {
      log.error('E_IMPORT', 'Failed to import runCmd from cluster/runCmd.mjs')
      return
    }

    const runApp = runAppModule.default
    const runCmd = runCmdModule.runCmd

    const App = await runApp(config)
    const app = await runCmd('prepare', App, config)

    if ('modules' in app && is.object(app.modules)) {
      globalThis.modules = app.modules
    }
    if ('actions' in app && is.object(app.actions)) {
      globalThis.actions = app.actions
    }
    if ('effects' in app && is.object(app.effects)) {
      globalThis.effects = app.effects
    }
    if ('helpers' in app && is.object(app.helpers)) {
      globalThis.helpers = app.helpers
    }
    if ('subscriptions' in app && is.object(app.subscriptions)) {
      globalThis.subscriptions = app.subscriptions
    }

    if (is.ownProp(app, 'lib') && is.object(app.lib)) {
      const lib = Object.fromEntries(
        Object.entries(app.lib).map(([k, v]) => [cases.camel(k), `lib.${cases.camel(k)}`]),
      )
      globalThis.lib = lib
    }

    /**
     * @param {ModuleFn} fn
     * @returns {(...args: unknown[]) => string}
     */
    const renderString =
      fn =>
      (...args) => {
        const view = 'View' in fn && is.fn(fn.View) ? fn.View(...args) : fn(...args)
        return renderToString(view)
          .replace(/&lt;/gim, '<')
          .replace(/&gt;/gim, '>')
          .replace(/&quot;/gim, '"')
      }

    if (globalThis.modules && is.object(globalThis.modules)) {
      Object.entries(globalThis.modules).forEach(([key, fn]) => {
        if (is.fn(fn)) {
          /** @type {Record<string, any>} */
          const gt = globalThis

          gt[key] = renderString(/** @type {ModuleFn} */ fn)
        }
      })
    }
  }
}
