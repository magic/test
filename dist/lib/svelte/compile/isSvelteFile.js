import path from 'node:path'
export const isSvelteFile = filePath => {
  const ext = path.extname(filePath)
  return ext === '.svelte' || ext === '.svx'
}
