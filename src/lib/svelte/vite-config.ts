import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'

type AliasEntry = {
  find: string | RegExp
  replacement: string
}

interface TSConfig {
  compilerOptions?: {
    baseUrl?: string
    paths?: Record<string, string[]>
  }
}

const VITE_CONFIG_NAMES = [
  'vite.config.js',
  'vite.config.ts',
  'vite.config.mjs',
  'vite.config.mts',
  'vite.config.cjs',
]

export const configCache = new Map<string, { config: unknown; mtime: number }>()

export const aliasCache = new Map<string, AliasEntry[]>()

export const defineCache = new Map<string, Record<string, unknown>>()

const svelteKitDetectionCache = new Map<string, boolean>()

export async function detectSvelteKit(rootDir: string): Promise<boolean> {
  const cached = svelteKitDetectionCache.get(rootDir)
  if (cached !== undefined) return cached

  const kitPath = path.join(rootDir, 'node_modules', '@sveltejs', 'kit')
  const exists = await fs.exists(kitPath)

  svelteKitDetectionCache.set(rootDir, exists)
  return exists
}

const findProjectRoot = async (sourceDir: string): Promise<string> => {
  let current = sourceDir
  const root = process.cwd()

  while (current && current !== path.dirname(current)) {
    const pkgPath = path.join(current, 'package.json')
    const exists = await fs.exists(pkgPath)
    if (exists) {
      return current
    }
    current = path.dirname(current)
  }

  return root
}

const findConfigFile = async (dir: string, configNames: string[]): Promise<string | null> => {
  for (const name of configNames) {
    const configPath = path.join(dir, name)
    const exists = await fs.exists(configPath)
    if (exists) {
      return configPath
    }
  }
  return null
}

const parseViteConfig = async (
  configPath: string,
): Promise<{ resolve?: { alias: AliasEntry[] }; define?: Record<string, unknown> }> => {
  const cached = configCache.get(configPath)
  if (cached) {
    const stats = await fs.stat(configPath)
    if (stats.mtime.getTime() === cached.mtime) {
      return cached.config as {
        resolve?: { alias: AliasEntry[] }
        define?: Record<string, unknown>
      }
    }
  }

  const configDir = path.dirname(configPath)
  const content = await fs.readFile(configPath, 'utf-8')

  const aliasMatch = content.match(/alias:\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/)

  let config: { resolve?: { alias: AliasEntry[] }; define?: Record<string, unknown> } = {}

  if (aliasMatch) {
    try {
      const aliasStr = aliasMatch[1]
      const cleaned = aliasStr
        .replace(/import\s*\([^)]*\)\s*as\s*\w+/g, '')
        .replace(/path\.resolve\(__dirname/g, `path.resolve("${configDir}"`)
        .replace(/path\.resolve\(__filename/g, `path.resolve("${configDir}"`)

      const evaluated = new Function('path', `return (${cleaned})`)(path)

      // Local helper to process single alias entry
      const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      const processSingleAlias = (entry: unknown): AliasEntry => {
        const e = entry as Record<string, unknown>
        const find = e.find
        const replacement = e.replacement

        let findVal: string | RegExp = is.string(find) || is.regex(find) ? find : String(find)
        let replacementVal: string = is.string(replacement) ? replacement : String(replacement)

        if (is.string(replacementVal) && !path.isAbsolute(replacementVal)) {
          replacementVal = path.resolve(configDir, replacementVal)
        }

        if (is.string(findVal)) {
          const regexMatch = findVal.match(/^\/(.+)\/([a-z]*)$/)
          if (regexMatch) {
            try {
              findVal = new RegExp(regexMatch[1], regexMatch[2])
            } catch {
              // leave as string if invalid regex
            }
          }
        }

        // Wildcard handling only if findVal is still a string
        if (is.string(findVal) && findVal.endsWith('*') && !findVal.startsWith('^')) {
          const findPrefix = findVal.slice(0, -1)
          const replacementSuffix = replacementVal.endsWith('*')
            ? replacementVal.slice(0, -1)
            : replacementVal
          const regex = new RegExp(`^${escapeRegex(findPrefix)}(.*)`)
          return { find: regex, replacement: replacementSuffix + '$1' }
        }

        return { find: findVal, replacement: replacementVal }
      }

      const processAlias = (alias: unknown): AliasEntry[] => {
        if (is.array(alias)) {
          return alias.flatMap(a => processSingleAlias(a))
        }
        if (is.object(alias)) {
          return [processSingleAlias(alias)]
        }
        return []
      }

      config.resolve = { alias: processAlias(evaluated) }
    } catch (e) {
      const message = is.error(e) ? e.message : String(e)
      console.warn(`[svelte-alias] Failed to parse vite.config alias: ${message}`)
    }
  }

  const defineMatch = content.match(/define:\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/)
  if (defineMatch) {
    try {
      const defineStr = defineMatch[1]
      const cleaned = defineStr
        .replace(/import\s*\([^)]*\)\s*as\s*\w+/g, '')
        .replace(/process\.env\./g, 'process.env.')

      const evaluated = new Function('process', `return (${cleaned})`)(process)

      config.define = evaluated
    } catch (e) {
      const message = is.error(e) ? e.message : String(e)
      console.warn(`[svelte-alias] Failed to parse vite.config define: ${message}`)
    }
  }

  const stats = await fs.stat(configPath)
  configCache.set(configPath, { config, mtime: stats.mtime.getTime() })
  return config
}

const normalizeAlias = (alias: unknown, configDir: string): AliasEntry[] => {
  if (is.array(alias)) {
    return alias.map(a => normalizeSingleAlias(a, configDir))
  }

  if (is.object(alias)) {
    return Object.entries(alias as Record<string, unknown>).map(([find, replacement]) =>
      normalizeSingleAlias({ find, replacement }, configDir),
    )
  }

  return []
}

const normalizeSingleAlias = (entry: unknown, configDir: string): AliasEntry => {
  const e = entry as Record<string, unknown>
  const find = e.find
  const replacement = e.replacement

  let findVal: string | RegExp = is.string(find) || is.regex(find) ? find : String(find)
  let replacementVal: string = is.string(replacement) ? replacement : String(replacement)

  if (is.string(replacementVal) && !path.isAbsolute(replacementVal)) {
    replacementVal = path.resolve(configDir, replacementVal)
  }

  if (is.string(findVal)) {
    const regexMatch = findVal.match(/^\/(.+)\/([a-z]*)$/)
    if (regexMatch) {
      try {
        findVal = new RegExp(regexMatch[1], regexMatch[2])
      } catch {
        return { find: String(findVal), replacement: replacementVal }
      }
    }

    if (is.regex(findVal)) {
      return { find: findVal, replacement: replacementVal }
    }

    const findPrefix = findVal.endsWith('*') ? findVal.slice(0, -1) : findVal
    const replacementSuffix = replacementVal.endsWith('*')
      ? replacementVal.slice(0, -1)
      : replacementVal

    if (findVal.endsWith('*') && !findVal.startsWith('^')) {
      const regex = new RegExp(`^${escapeRegex(findPrefix)}(.*)`)
      return {
        find: regex,
        replacement: replacementSuffix + '$1',
      }
    }

    return { find: findVal, replacement: replacementVal }
  }

  if (is.regex(findVal)) {
    return { find: findVal, replacement: replacementVal }
  }

  return { find: String(findVal), replacement: replacementVal }
}

const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const stripJsonComments = (content: string): string => {
  let result = ''
  let inString = false
  let stringChar = ''

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (!inString) {
      if (char === '"') {
        inString = true
        stringChar = '"'
        result += char
      } else if (char === "'") {
        inString = true
        stringChar = "'"
        result += char
      } else if (char === '/' && nextChar === '/') {
        while (i < content.length && content[i] !== '\n') {
          i++
        }
      } else if (char === '/' && nextChar === '*') {
        while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) {
          i++
        }
        i++
      } else {
        result += char
      }
    } else {
      result += char
      if (char === stringChar && content[i - 1] !== '\\') {
        inString = false
      }
    }
  }

  return result
}

const parseTsConfig = async (rootDir: string): Promise<AliasEntry[]> => {
  const cacheKey = rootDir + ':tsconfig'
  const cached = aliasCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const tsconfigPath = path.join(rootDir, 'tsconfig.json')
  const exists = await fs.exists(tsconfigPath)
  if (!exists) {
    aliasCache.set(cacheKey, [])
    return []
  }

  try {
    const rawContent = await fs.readFile(tsconfigPath, 'utf-8')
    const content = stripJsonComments(rawContent)
    const tsconfig = JSON.parse(content) as TSConfig
    const baseUrl = tsconfig.compilerOptions?.baseUrl || '.'
    let paths: Record<string, string[]> = tsconfig.compilerOptions?.paths || {}

    // Also check .svelte-kit/tsconfig.json for additional paths (like $lib)
    const svelteKitTsconfigPath = path.join(rootDir, '.svelte-kit', 'tsconfig.json')
    const svelteKitExists = await fs.exists(svelteKitTsconfigPath)

    if (svelteKitExists) {
      const svelteKitRaw = await fs.readFile(svelteKitTsconfigPath, 'utf-8')
      const svelteKitConfig = JSON.parse(svelteKitRaw) as TSConfig
      const svelteKitPaths = svelteKitConfig.compilerOptions?.paths || {}
      // Normalize svelte-kit paths that use ../ to point to correct location
      const normalizedSvelteKitPaths: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(svelteKitPaths)) {
        if (Array.isArray(value) && value[0]?.startsWith('../')) {
          // ../src/lib/* -> the ../ is relative to .svelte-kit/, so we need to go UP one level
          // then back to src/lib/. So ../src/lib/* becomes src/lib/*
          let normalizedTarget = value[0].replace(/^\.\.\//, '')
          normalizedSvelteKitPaths[key] = [normalizedTarget]
        } else {
          normalizedSvelteKitPaths[key] = value
        }
      }

      // Merge paths, with svelte-kit paths taking precedence
      paths = { ...paths, ...normalizedSvelteKitPaths }
    }

    const resolvedBaseUrl = path.isAbsolute(baseUrl) ? baseUrl : path.resolve(rootDir, baseUrl)

    const aliases = Object.entries(paths).map(([pattern, targets]) => {
      const target = targets[0]
      if (!target) return null

      const hasWildcard = pattern.endsWith('*') && !pattern.startsWith('^')
      const hasTargetWildcard = target.endsWith('*')

      let find

      let replacement

      if (hasWildcard) {
        const prefix = pattern.slice(0, -1)
        find = new RegExp(`^${escapeRegex(prefix)}(.*)`)

        if (hasTargetWildcard) {
          const targetPrefix = target.slice(0, -1)
          // If target is absolute (starts with /), use it directly without path.sep
          // Otherwise resolve relative to baseUrl
          if (targetPrefix.startsWith('/')) {
            replacement = targetPrefix + '$1'
          } else {
            replacement = path.resolve(resolvedBaseUrl, targetPrefix) + path.sep + '$1'
          }
        } else if (target.startsWith('/')) {
          // Absolute path without wildcard
          replacement = target
        } else {
          replacement = path.resolve(resolvedBaseUrl, target)
        }
      } else {
        find = pattern
        replacement = path.resolve(resolvedBaseUrl, target)
      }

      return { find, replacement }
    })

    const filteredAliases = aliases.filter(x => x !== null)
    aliasCache.set(cacheKey, filteredAliases as AliasEntry[])
    return filteredAliases as AliasEntry[]
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse tsconfig.json: ${message}`)
    return []
  }
}

const loadViteAliases = async (rootDir: string): Promise<AliasEntry[]> => {
  const cacheKey = rootDir + ':vite'
  const cached = aliasCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)

  if (!configPath) {
    aliasCache.set(cacheKey, [])
    return []
  }

  try {
    const config = await parseViteConfig(configPath)
    const configDir = path.dirname(configPath)
    const resolveConfig = config.resolve as Record<string, unknown> | undefined
    const aliases = normalizeAlias(resolveConfig?.alias, configDir)
    aliasCache.set(cacheKey, aliases)
    return aliases
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse vite.config: ${message}`)
    return []
  }
}

const loadViteDefine = async (rootDir: string): Promise<Record<string, unknown>> => {
  const cacheKey = rootDir + ':vite-define'
  const cached = defineCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)

  if (!configPath) {
    defineCache.set(cacheKey, {})
    return {}
  }

  try {
    const config = await parseViteConfig(configPath)
    const defineConfig = config.define as Record<string, unknown> | undefined
    defineCache.set(cacheKey, defineConfig || {})
    return defineConfig || {}
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse vite.config define: ${message}`)
    return {}
  }
}

/**
 * Classify import type
 */
const classifyImport = (importPath: string): 'relative' | 'scoped' | 'vite-alias' | 'bare' => {
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return 'relative'
  }
  if (importPath.startsWith('@')) {
    return 'scoped'
  }
  if (importPath.startsWith('$')) {
    return 'vite-alias'
  }
  return 'bare'
}

export const resolveAlias = async (
  importPath: string,
  sourceFilePath: string,
): Promise<string | null> => {
  const importType = classifyImport(importPath)

  // Only process relative, vite-alias and scoped imports
  if (importType !== 'relative' && importType !== 'vite-alias' && importType !== 'scoped') {
    return null
  }

  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)

  const viteAliases = await loadViteAliases(rootDir)
  const tsAliases = await parseTsConfig(rootDir)

  const allAliases = [...viteAliases, ...tsAliases]

  for (const { find, replacement } of allAliases) {
    let resolved: string | null = null

    if (is.string(find)) {
      if (importPath === find || importPath.startsWith(find + '/')) {
        if (importPath === find) {
          resolved = replacement
        } else {
          resolved = importPath.replace(find, replacement)
        }
      }
    } else if (is.regex(find)) {
      const match = importPath.match(find)
      if (match) {
        resolved = importPath.replace(find, replacement)
      }
    }

    if (resolved) {
      const exists = await fs.exists(resolved)
      if (exists) {
        return resolved
      }

      // Try with extensions, handling .js->.ts conversion
      const withExtensions = [
        '',
        '.js',
        '.svelte',
        '.ts',
        '/index.js',
        '/index.svelte',
        '/index.ts',
      ]

      // Also try removing .js extension and adding .ts
      let baseResolved = resolved
      if (resolved.endsWith('.js')) {
        baseResolved = resolved.slice(0, -3) // remove .js
      }

      for (const ext of withExtensions) {
        const withExt = resolved + ext
        const exists = await fs.exists(withExt)
        if (exists) {
          return withExt
        }
        // Also try without .js
        if (baseResolved !== resolved) {
          const noJsExt = baseResolved + ext
          if (await fs.exists(noJsExt)) {
            return noJsExt
          }
        }
      }
    }
  }

  return null
}

/**
 * Resolve Vite/SvelteKit aliases ($lib, $app, $env, etc.)
 * This is called from compile.js for non-relative imports
 */
export const resolveViteAlias = async (
  importPath: string,
  sourceFilePath: string,
): Promise<string | null> => {
  const importType = classifyImport(importPath)

  // Only handle vite-alias and bare imports here
  if (importType !== 'vite-alias' && importType !== 'bare') {
    return null
  }

  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)

  // Use shims for $app/* imports (SvelteKit internal deps can't be resolved in test env)
  if (importPath.startsWith('$app/')) {
    const shimName = importPath.slice(5) // after "$app/"
    const shimPath = path.join(rootDir, 'src/lib/svelte/shims/$app', shimName)
    const candidates = [
      shimPath + '.js',
      shimPath + '.ts',
      path.join(shimPath, 'index.js'),
      path.join(shimPath, 'index.ts'),
    ]
    for (const candidate of candidates) {
      if (await fs.exists(candidate)) {
        return candidate
      }
    }
    // If not found, fall through to other resolution methods
  }

  // Handle $lib and other $app/*, $env/* aliases via tsconfig paths
  if (importPath.startsWith('$')) {
    const viteAliases = await loadViteAliases(rootDir)
    const tsAliases = await parseTsConfig(rootDir)
    const allAliases = [...viteAliases, ...tsAliases]

    for (const { find, replacement } of allAliases) {
      let resolved: string | null = null

      if (is.string(find)) {
        if (importPath === find || importPath.startsWith(find + '/')) {
          if (importPath === find) {
            resolved = replacement
          } else {
            resolved = importPath.replace(find, replacement)
          }
        }
      } else if (is.regex(find)) {
        const match = importPath.match(find)
        if (match) {
          resolved = importPath.replace(find, replacement)
        }
      }

      if (resolved) {
        // Check if file exists with various extensions
        const extensions = ['', '.js', '.svelte', '.ts', '/index.js', '/index.svelte', '/index.ts']

        for (const ext of extensions) {
          const withExt = resolved + ext
          const exists = await fs.exists(withExt)
          if (exists) {
            return withExt
          }
        }
      }
    }

    // Fallback: $lib maps to src/lib
    if (importPath.startsWith('$lib')) {
      const aliasPath = importPath.slice(1) // Remove $
      const libPath = path.join(rootDir, 'src', aliasPath)

      const extensions = ['', '.js', '.svelte', '.ts', '/index.js', '/index.svelte', '/index.ts']
      for (const ext of extensions) {
        const withExt = libPath + ext
        if (await fs.exists(withExt)) {
          return withExt
        }
      }
    }
  } // end if importPath starts with $

  // Shim $app/* imports to local test shims
  if (importPath.startsWith('$app/')) {
    const shimName = importPath.slice(5) // after "$app/"
    const shimPath = path.join(rootDir, 'src/lib/svelte/shims/$app', shimName)
    const candidates = [
      shimPath + '.js',
      shimPath + '.ts',
      path.join(shimPath, 'index.js'),
      path.join(shimPath, 'index.ts'),
    ]
    for (const candidate of candidates) {
      if (await fs.exists(candidate)) {
        return candidate
      }
    }
  }

  return null
}

export const getProjectRoot = async (sourceDir: string): Promise<string> =>
  await findProjectRoot(sourceDir)

/**
 * Get vite define variables for a source file
 */
export const getViteDefine = async (sourceFilePath: string): Promise<Record<string, unknown>> => {
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)
  return await loadViteDefine(rootDir)
}

// --- SvelteKit Config Helper ---

/**
 * Get SvelteKit configuration from vite.config.ts if available.
 * Returns partial config: { dev?, base?, version?, building? }
 */
export function getSvelteKitConfig(rootDir: string): Record<string, any> {
  const configPaths = [
    path.join(rootDir, 'vite.config.ts'),
    path.join(rootDir, 'vite.config.js'),
    path.join(rootDir, 'vite.config.mts'),
    path.join(rootDir, 'vite.config.mjs'),
    path.join(rootDir, 'vite.config.cjs'),
  ]
  for (const configPath of configPaths) {
    try {
      // Check existence via fs.exists would be async; we're using sync read
      // Use try/catch
      const content = require('fs').readFileSync(configPath, 'utf-8')
      // Look for defineConfig({ kit: { ... } })
      const kitMatch = content.match(/defineConfig\s*\(\s*\{[\s\S]*?kit\s*:\s*\{([\s\S]*?)\}/)
      if (kitMatch) {
        const kitConfig = kitMatch[1]
        const parseVal = (key: string) => {
          const m = kitConfig.match(new RegExp(`${key}\\s*:\\s*([^,\\}\\n]+)`))
          if (m) {
            let val = m[1].trim()
            if (val === 'true' || val === 'false') return val === 'true'
            if (val.startsWith("'") || val.startsWith('"')) return val.slice(1, -1)
            return val
          }
          return undefined
        }
        return {
          dev: parseVal('dev'),
          base: parseVal('base'),
          version: parseVal('version'),
          building: parseVal('building'),
        }
      }
    } catch (e) {
      // file not found or parse error, continue
    }
  }
  return {}
}
