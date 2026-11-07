/* ---------------------------------------------------------------------------
 * Prewarm a worker's one-time module costs outside any test's timeout budget.
 *
 * The first mount in a fresh worker pays for the whole component graph
 * (compile + import + svelte runtime) — several seconds, much more under
 * machine load. In a batched worker (worker reuse / beforeAll batches) the
 * first test would carry that cost inside its per-test timeout. Importing
 * the first referenced component's compiled module here (no mount, no props)
 * moves ~90% of the cost out of the timeout: later mounts take ~40 ms.
 *
 * Best-effort: any failure is swallowed — the real test surfaces a genuine
 * error at mount time.
 * -------------------------------------------------------------------------- */
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
import is from '@magic/types'
import { compileSvelteWithWrite } from '../../lib/svelte/compile/compileSvelteWithWrite.js'
import {
  resolveImportMapSpecifier,
  findNearestPackageJson,
} from '../../lib/svelte/compile/resolveImportMap.js'
import { getCwd } from '../../constants.js'
const collectComponents = (node, out, seen) => {
  if (is.array(node)) {
    if (seen.has(node)) {
      return
    }
    seen.add(node)
    for (const item of node) {
      collectComponents(item, out, seen)
    }
    return
  }
  if (is.objectNative(node)) {
    if (seen.has(node)) {
      return
    }
    seen.add(node)
    const { component } = node
    if (is.string(component)) {
      out.add(component)
    } else if (is.array(component) && is.string(component[0])) {
      out.add(component[0])
    }
    for (const value of Object.values(node)) {
      collectComponents(value, out, seen)
    }
  }
}
const resolveComponentPath = async componentPath => {
  try {
    if (componentPath.startsWith('#')) {
      const pkgJsonPath = await findNearestPackageJson(componentPath)
      const resolved = await resolveImportMapSpecifier(componentPath, pkgJsonPath)
      return resolved || path.resolve(getCwd(), componentPath)
    }
    return path.isAbsolute(componentPath) ? componentPath : path.resolve(getCwd(), componentPath)
  } catch {
    return null
  }
}
/**
 * Import the compiled module of each referenced component (no mount). Warms
 * the worker's module graph + compile caches so the first real mount is fast.
 */
export const prewarmWorkerModules = async tests => {
  const refs = new Set()
  collectComponents(tests, refs, new WeakSet())
  for (const ref of refs) {
    try {
      const resolved = await resolveComponentPath(ref)
      if (!resolved) {
        continue
      }
      const { importUrl } = await compileSvelteWithWrite(resolved)
      await import(__rewriteRelativeImportExtension(importUrl))
    } catch {
      // best-effort — the real mount surfaces genuine errors
    }
  }
}
//# sourceMappingURL=prewarmWorkerModules.js.map
