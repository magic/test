import fs from '@magic/fs'

export const tryStat = async (filePath: string) => {
  try {
    return await fs.stat(filePath)
  } catch {
    return null
  }
}
