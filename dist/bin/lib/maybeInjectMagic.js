var __rewriteRelativeImportExtension =
  (this && this.__rewriteRelativeImportExtension) ||
  function (path, preserveJsx) {
    if (typeof path === 'string' && /^\.\.?\//.test(path)) {
      return path.replace(
        /\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,
        function (m, tsx, d, ext, cm) {
          return tsx
            ? preserveJsx
              ? '.jsx'
              : '.js'
            : d && (!ext || !cm)
              ? m
              : d + ext + '.' + cm.toLowerCase() + 'js'
        },
      )
    }
    return path
  }
import path from 'node:path'
import cases from '@magic/cases'
import fs from '@magic/fs'
import is from '@magic/types'
import log from '@magic/log'
const cwd = process.cwd()
const toImportPath = p => p.split(path.sep).join('/')
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
      const checkPropsModule = await import(__rewriteRelativeImportExtension(checkPropPath))
      if ('CHECK_PROPS' in checkPropsModule) {
        globalThis.CHECK_PROPS = checkPropsModule.CHECK_PROPS
      }
    }
    const magicPath = isRooted ? toImportPath(path.join(importRoot, 'index.mjs')) : '@magic/core'
    const core = await import(__rewriteRelativeImportExtension(magicPath))
    if ('renderToString' in core && is.fn(core.renderToString)) {
      renderToString = core.renderToString
    }
    const configModule = await import(
      __rewriteRelativeImportExtension(toImportPath(path.join(importRoot, 'config.mjs')))
    )
    if ('runConfig' in configModule && is.fn(configModule.runConfig)) {
      config = await configModule.runConfig({ silent: true })
    }
  } catch (e) {
    const err = e
    if (err.code !== 'ERR_MODULE_NOT_FOUND') {
      log.error(String(e))
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
    const runAppModule = await import(
      __rewriteRelativeImportExtension(toImportPath(path.join(importRoot, 'modules/app.mjs')))
    )
    const runCmdModule = await import(
      __rewriteRelativeImportExtension(toImportPath(path.join(importRoot, 'cluster/runCmd.mjs')))
    )
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
        Object.entries(app.lib).map(([k]) => [cases.camel(k), `lib.${cases.camel(k)}`]),
      )
      globalThis.lib = lib
    }
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
          const gt = globalThis
          gt[key] = renderString(fn)
        }
      })
    }
  }
}
