import path from 'node:path'

export const transformForNode = (code: string, filePath: string): string => {
  const componentName = path.basename(filePath, '.svelte')
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '_') + '$$component'

  const transformed = code.replace(/_unknown_/g, safeName)

  return transformed
}
