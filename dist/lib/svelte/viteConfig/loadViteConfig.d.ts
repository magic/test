import type { ViteConfig } from '../../../types.js'

import { type AliasEntry } from './cache.js'
export declare const loadViteConfig: (rootDir: string) => Promise<ViteConfig>
export declare const getViteAliases: (config: ViteConfig, configDir: string) => AliasEntry[]
export declare const getViteDefine: (config: ViteConfig) => Record<string, unknown>
