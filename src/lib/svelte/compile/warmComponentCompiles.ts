import path from 'node:path'

import log from '@magic/log'
import is from '@magic/types'

import { findNearestPackageJson, resolveImportMapSpecifier } from './resolveImportMap.js'
import { compileSvelteWithWrite } from './compileSvelteWithWrite.js'
import { parallelMap } from './parallelMap.js'
import { getCwd } from '../../../constants.js'

type ComponentRef = { component?: string | [string, Record<string, unknown>?] }

/**
 * Recursively collect component paths referenced by test entries.
 * Handles arrays, nested test objects, and both the `component: 'path'` and
 * `component: ['path', props]` forms. Functions (lazy tests) and other
 * non-data values are skipped.
 */
const collectComponentPaths = (node: unknown, out: Set<string>, seen: WeakSet<object>): void => {
  if (is.array(node)) {
    if (seen.has(node)) {
      return
    }
    seen.add(node)
    for (const item of node) {
      collectComponentPaths(item, out, seen)
    }
    return
  }

  if (is.objectNative(node)) {
    if (seen.has(node)) {
      return
    }
    seen.add(node)

    const { component } = node as ComponentRef
    if (is.string(component)) {
      out.add(component)
    } else if (is.array(component) && is.string(component[0])) {
      out.add(component[0]!)
    }

    for (const value of Object.values(node)) {
      collectComponentPaths(value, out, seen)
    }
  }
}

const resolveComponentPath = async (componentPath: string): Promise<string | null> => {
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
 * Pre-compile all Svelte components referenced by the collected tests.
 *
 * The first compilation of a component pays for its entire Svelte dependency
 * graph (node_modules .svelte files, barrels), which can take tens of seconds
 * (much longer under c8 / V8 coverage). Running this during the collection
 * phase - outside any per-test timeout - means the first test that mounts a
 * component hits warm caches instead of timing out on the one-time compile.
 *
 * Failures are logged but non-fatal: the actual mount surfaces the error at
 * test time.
 */
export const warmComponentCompiles = async (tests: unknown): Promise<void> => {
  const refs = new Set<string>()
  collectComponentPaths(tests, refs, new WeakSet())

  if (refs.size === 0) {
    return
  }

  // Only worth doing (and only possible) when svelte is installed
  try {
    await import('svelte/compiler')
  } catch {
    return
  }

  const resolved = new Map<string, string>()
  for (const ref of refs) {
    const p = await resolveComponentPath(ref)
    if (p && !resolved.has(p)) {
      resolved.set(p, ref)
    }
  }

  if (resolved.size === 0) {
    return
  }

  await parallelMap(
    [...resolved.entries()],
    async ([resolvedPath, ref]) => {
      try {
        const { importUrl } = await compileSvelteWithWrite(resolvedPath)
        // Pre-import the compiled module graph on the MAIN thread. Compiling
        // (above) only writes the .svelte.js to the disk cache — the one-time
        // cost of actually loading a component's full dependency graph (the
        // package barrel + svelte deps, ~seconds) is paid by the first test
        // that mounts it, under the svelte mutex and inside its per-test
        // timeout. Importing here (collection phase, outside any per-test
        // timeout) moves that cost upfront and lets the test's mount reuse the
        // already-populated ESM module registry (subsequent mounts are ~ms).
        // Concurrent imports of the shared barrel are deduped by the ESM
        // registry, so the heavy graph load happens once.
        await import(importUrl)
      } catch (e) {
        log.warn(`Component precompile failed for ${ref}: ${is.error(e) ? e.message : String(e)}`)
      }
    },
    6,
  )
}
