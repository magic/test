import fs from '@magic/fs'
import path from 'node:path'

export const findConfigFile = async (
  dir: string,
  configNames: string[],
): Promise<string | null> => {
  for (const name of configNames) {
    const configPath = path.join(dir, name)
    const exists = await fs.exists(configPath)
    if (exists) {
      return configPath
    }
  }
  return null
}
