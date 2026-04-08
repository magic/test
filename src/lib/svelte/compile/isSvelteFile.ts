import path from 'node:path'

export const isSvelteFile = (filePath: string): boolean => {
  const ext = path.extname(filePath)
  return ext === '.svelte' || ext === '.svx'
}
