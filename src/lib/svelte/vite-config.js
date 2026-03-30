import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'

/**
 * @typedef {Object} AliasEntry
 * @property {string|RegExp} find
 * @property {string} replacement
 */

/** @type {string[]} */
const VITE_CONFIG_NAMES = [
  'vite.config.js',
  'vite.config.ts',
  'vite.config.mjs',
  'vite.config.mts',
  'vite.config.cjs',
]

/** @type {Map<string, { config: unknown, mtime: number }>} */
export const configCache = new Map()
/** @type {Map<string, AliasEntry[]>} */
export const aliasCache = new Map()

/**
 * @param {string} sourceDir
 * @returns {Promise<string>}
 */
const findProjectRoot = async sourceDir => {
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

/**
 * @param {string} dir
 * @param {string[]} configNames
 * @returns {Promise<string | null>}
 */
const findConfigFile = async (dir, configNames) => {
  for (const name of configNames) {
    const configPath = path.join(dir, name)
    const exists = await fs.exists(configPath)
    if (exists) {
      return configPath
    }
  }
  return null
}

/**
 * @param {string} configPath
 * @returns {Promise<unknown>}
 */
const parseViteConfig = async configPath => {
  const cached = configCache.get(configPath)
  if (cached) {
    const stats = await fs.stat(configPath)
    if (stats.mtime.getTime() === cached.mtime) {
      return cached.config
    }
  }

  const configDir = path.dirname(configPath)
  const content = await fs.readFile(configPath, 'utf-8')

  const aliasMatch = content.match(/alias:\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/)
  /** @type {Record<string, unknown>} */
  let config = {}

  if (aliasMatch) {
    try {
      const aliasStr = aliasMatch[1]
      const cleaned = aliasStr
        .replace(/import\s*\([^)]*\)\s*as\s*\w+/g, '')
        .replace(/path\.resolve\(__dirname/g, `path.resolve("${configDir}"`)
        .replace(/path\.resolve\(__filename/g, `path.resolve("${configDir}"`)

      const evaluated = new Function('path', `return (${cleaned})`)(path)

      /** @type {(alias: unknown) => unknown} */
      const processedAlias = alias => {
        if (is.array(alias)) {
          return alias.map(processedAlias)
        }
        if (is.object(alias)) {
          /** @type {Record<string, unknown>} */
          const result = { .../** @type {object} */ (alias) }
          if (is.string(result.find)) {
            const regexMatch = result.find.match(/^\/(.+)\/([a-z]*)$/)
            if (regexMatch) {
              try {
                result.find = new RegExp(regexMatch[1], regexMatch[2])
              } catch (e) {
                console.warn(`[svelte-alias] Invalid regex pattern: ${regexMatch[0]}`, e)
              }
            }
          }
          return result
        }
        return alias
      }

      config.resolve = { alias: processedAlias(evaluated) }
    } catch (e) {
      const message = is.error(e) ? e.message : String(e)
      console.warn(`[svelte-alias] Failed to parse vite.config alias: ${message}`)
    }
  }

  const stats = await fs.stat(configPath)
  configCache.set(configPath, { config, mtime: stats.mtime.getTime() })

  return config
}

/**
 * @param {unknown} alias
 * @param {string} configDir
 * @returns {AliasEntry[]}
 */
const normalizeAlias = (alias, configDir) => {
  if (is.array(alias)) {
    return alias.map(a => normalizeSingleAlias(a, configDir))
  }

  if (is.object(alias)) {
    return Object.entries(/** @type {Record<string, unknown>} */ (alias)).map(
      ([find, replacement]) => normalizeSingleAlias({ find, replacement }, configDir),
    )
  }

  return []
}

/**
 * @param {unknown} entry
 * @param {string} configDir
 * @returns {AliasEntry}
 */
const normalizeSingleAlias = (entry, configDir) => {
  const e = /** @type {Record<string, unknown>} */ (entry)
  const find = e.find
  const replacement = e.replacement

  /** @type {string | RegExp} */
  let findVal = is.string(find) || is.regex(find) ? find : String(find)
  /** @type {string} */
  let replacementVal = is.string(replacement) ? replacement : String(replacement)

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

/**
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * @param {string} content
 * @returns {string}
 */
const stripJsonComments = content => {
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

/**
 * @param {string} rootDir
 * @returns {Promise<AliasEntry[]>}
 */
const parseTsConfig = async rootDir => {
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
    const tsconfig = JSON.parse(content)
    const baseUrl = tsconfig.compilerOptions?.baseUrl || '.'
    const paths = tsconfig.compilerOptions?.paths || {}

    const resolvedBaseUrl = path.isAbsolute(baseUrl) ? baseUrl : path.resolve(rootDir, baseUrl)

    /** @type {(AliasEntry|null)[]} */
    const aliases = Object.entries(paths).map(([pattern, targets]) => {
      const target = targets[0]
      if (!target) return null

      const hasWildcard = pattern.endsWith('*') && !pattern.startsWith('^')
      const hasTargetWildcard = target.endsWith('*')

      /** @type {string|RegExp} */
      let find
      /** @type {string} */
      let replacement

      if (hasWildcard) {
        const prefix = pattern.slice(0, -1)
        find = new RegExp(`^${escapeRegex(prefix)}(.*)`)

        if (hasTargetWildcard) {
          const targetPrefix = target.slice(0, -1)
          replacement = path.resolve(resolvedBaseUrl, targetPrefix) + '$1'
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
    aliasCache.set(cacheKey, /** @type {AliasEntry[]} */ (filteredAliases))
    return /** @type {AliasEntry[]} */ (filteredAliases)
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse tsconfig.json: ${message}`)
    return []
  }
}

/**
 * @param {string} rootDir
 * @returns {Promise<AliasEntry[]>}
 */
const loadViteAliases = async rootDir => {
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
    const config = /** @type {Record<string, unknown>} */ (await parseViteConfig(configPath))
    const configDir = path.dirname(configPath)
    const resolveConfig = /** @type {Record<string, unknown> | undefined} */ (config.resolve)
    const aliases = normalizeAlias(resolveConfig?.alias, configDir)
    aliasCache.set(cacheKey, aliases)
    return aliases
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse vite.config: ${message}`)
    return []
  }
}

/**
 * @param {string} importPath
 * @param {string} sourceFilePath
 * @returns {Promise<string|null>}
 */
export const resolveAlias = async (importPath, sourceFilePath) => {
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)

  const viteAliases = await loadViteAliases(rootDir)
  const tsAliases = await parseTsConfig(rootDir)

  const allAliases = [...viteAliases, ...tsAliases]

  for (const { find, replacement } of allAliases) {
    /** @type {string|null} */
    let resolved = null

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

      const withExtensions = ['', '.js', '.svelte', '.ts', '/index.js', '/index.svelte']
      for (const ext of withExtensions) {
        const withExt = resolved + ext
        const exists = await fs.exists(withExt)
        if (exists) {
          return withExt
        }
      }
    }
  }

  if (importPath.startsWith('$')) {
    const aliasName = importPath.slice(1)
    const commonPaths = [
      path.join(rootDir, 'src', aliasName),
      path.join(rootDir, 'lib', aliasName),
      path.join(rootDir, aliasName),
    ]

    for (const resolved of commonPaths) {
      const exists = await fs.exists(resolved)
      if (exists) {
        return resolved
      }
      const withExtensions = ['', '.js', '.svelte', '.ts', '/index.js', '/index.svelte']
      for (const ext of withExtensions) {
        const withExt = resolved + ext
        const exists = await fs.exists(withExt)
        if (exists) {
          return withExt
        }
      }
    }
  }

  return null
}

/**
 * @param {string} sourceDir
 * @returns {Promise<string>}
 */
export const getProjectRoot = async sourceDir => await findProjectRoot(sourceDir)
