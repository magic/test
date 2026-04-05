// Shim for $app/environment
// Reads config from vite.config.ts if available, otherwise uses defaults

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

interface ViteKitConfig {
  dev?: boolean;
  building?: boolean;
  version?: string;
}

function getViteConfig(): ViteKitConfig {
  try {
    const root = process.cwd();
    const configPaths = [
      join(root, 'vite.config.ts'),
      join(root, 'vite.config.js'),
      join(root, 'vite.config.mts'),
      join(root, 'vite.config.mjs'),
      join(root, 'vite.config.cjs')
    ];
    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        const content = readFileSync(configPath, 'utf-8');
        // Look for defineConfig({ kit: { ... } })
        const kitMatch = content.match(/defineConfig\s*\(\s*\{[\s\S]*?kit\s*:\s*\{([\s\S]*?)\}/);
        if (kitMatch) {
          const kitBlock = kitMatch[1];
          const parseVal = (key: string): any => {
            const m = kitBlock.match(new RegExp(`${key}\s*:\s*([^,\}\n]+)`));
            if (m) {
              let val = m[1].trim();
              if (val === 'true' || val === 'false') return val === 'true';
              if (val.startsWith("'") || val.startsWith('"')) return val.slice(1, -1);
              return val;
            }
            return undefined;
          };
          return {
            dev: parseVal('dev'),
            building: parseVal('building'),
            version: parseVal('version')
          };
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return {};
}

const cfg = getViteConfig();

export const browser: boolean = true;
export const dev: boolean = cfg.dev !== undefined ? !!cfg.dev : true;
export const prod: boolean = !dev;
export const building: boolean = cfg.building !== undefined ? !!cfg.building : false;
export const version: string = cfg.version || '';
