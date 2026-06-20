import fs from '@magic/fs'
export const tryStat = async filePath => {
  try {
    return await fs.stat(filePath)
  } catch {
    return null
  }
}
