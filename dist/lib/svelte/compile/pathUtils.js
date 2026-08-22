import fs from '@magic/fs'
export const EXTENSION_CANDIDATES = [
  '',
  '.js',
  '.svelte',
  '.ts',
  '/index.js',
  '/index.svelte',
  '/index.ts',
]
export const FALLBACK_CANDIDATES = ['index.js', 'src/index.js', './dist/index.js']
export const isSkipPattern = spec => {
  if (!spec) {
    return true
  }
  return (
    spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('$') || spec.startsWith('/')
  )
}
export const resolveFilePath = async (base, extensions = EXTENSION_CANDIDATES) => {
  for (const ext of extensions) {
    const candidate = base + ext
    if (await fs.exists(candidate)) {
      try {
        if (ext === '') {
          const stat = await fs.stat(candidate)
          if (stat.isDirectory()) {
            const siblingFile = base + '.js'
            if (await fs.exists(siblingFile)) {
              return siblingFile
            }
            const indexPath = candidate + '/index.js'
            if (await fs.exists(indexPath)) {
              return indexPath
            }
            continue
          }
        }
      } catch {
        continue
      }
      return candidate
    }
    if (base.endsWith('.js') && ext !== '') {
      const noJsExt = base.slice(0, -3) + ext
      if (await fs.exists(noJsExt)) {
        try {
          if (ext === '') {
            const stat = await fs.stat(noJsExt)
            if (stat.isDirectory()) {
              continue
            }
          }
        } catch {
          continue
        }
        return noJsExt
      }
    }
  }
  return null
}
