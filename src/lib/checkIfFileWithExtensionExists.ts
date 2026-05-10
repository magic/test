import fs from '@magic/fs'

// Check if file exists with various extensions
export const extensions = [
  '',
  '.js',
  '.svelte',
  '.svx',
  '.ts',
  '.svelte.ts',
  '.svelte.js',
  '.svelte.mjs',
  '.svelte.tsx',
  '.svelte.jsx',
  '.svx.ts',
  '.svx.js',
  '.svx.mjs',
  '.svx.tsx',
  '.svx.jsx',
  '/index.js',
  '/index.svelte',
  '/index.svx',
  '/index.ts',
  '/index.svelte.ts',
  '/index.svelte.js',
  '/index.svelte.mjs',
  '/index.svx.ts',
  '/index.svx.js',
  '/index.svx.mjs',
  '.svelte.ts',
  '.svelte.js',
  '.svelte.mjs',
  '.svx.ts',
  '.svx.js',
  '.svx.mjs',
]

export const checkIfFileWithExtensionExists = async (file: string): Promise<string | boolean> => {
  for (const ext of extensions) {
    const withExt = file + ext
    const exists = await fs.exists(withExt)
    if (exists) {
      // Skip if withExt is a directory and ext is empty (raw resolved path is a directory)
      if (ext === '') {
        try {
          const stat = await fs.stat(withExt)
          if (stat.isDirectory()) {
            continue
          }
        } catch {
          continue
        }
      }
      return withExt
    }
  }

  return false
}
