// Shim for $app/environment
// Reads config from vite.config.ts if available, otherwise uses defaults

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

interface ViteKitConfig {
  dev?: boolean
  building?: boolean
  version?: string
}

function getViteConfig(): ViteKitConfig {
  try {
    const root = process.cwd()
    const configPaths = [
      join(root, 'vite.config.ts'),
      join(root, 'vite.config.js'),
      join(root, 'vite.config.mts'),
      join(root, 'vite.config.mjs'),
      join(root, 'vite.config.cjs'),
    ]
    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        const content = readFileSync(configPath, 'utf-8')
        // Look for defineConfig({ kit: { ... } })
        const kitMatch = content.match(/defineConfig\s*\(\s*\{[\s\S]*?kit\s*:\s*\{([\s\S]*?)\}/)
        if (kitMatch) {
          const kitBlock = kitMatch[1]
          if (!kitBlock) continue
          const parseValStr = (key: string): string | undefined => {
            const m = kitBlock?.match(new RegExp(`${key}\\s*:\\s*([^,\\}\\n]+)`))
            if (m && m[1]) {
              const val = m[1].trim()
              if (val.startsWith("'") || val.startsWith('"')) return val.slice(1, -1)
              return val
            }
            return undefined
          }
          const parseValBool = (key: string): boolean | undefined => {
            const m = kitBlock?.match(new RegExp(`${key}\\s*:\\s*([^,\\}\\n]+)`))
            if (m && m[1]) {
              const val = m[1].trim()
              if (val === 'true') return true
              if (val === 'false') return false
            }
            return undefined
          }
          return {
            dev: parseValBool('dev'),
            building: parseValBool('building'),
            version: parseValStr('version'),
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return {}
}

const cfg = getViteConfig()

export const browser: boolean = true
export const dev: boolean = cfg.dev !== undefined ? !!cfg.dev : true
export const prod: boolean = !dev
export const building: boolean = cfg.building !== undefined ? !!cfg.building : false
export const version: string = cfg.version || ''
