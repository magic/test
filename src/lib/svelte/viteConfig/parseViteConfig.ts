import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'

import { configCache } from './cache.js'
import type { AliasEntry, ViteConfig } from '../../../types.js'

export const parseViteConfig = async (configPath: string): Promise<ViteConfig> => {
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

  const config: ViteConfig = {}

  if (aliasMatch && aliasMatch[1]) {
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
          if (regexMatch && regexMatch[1] && regexMatch[2]) {
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
  if (defineMatch && defineMatch[1]) {
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
