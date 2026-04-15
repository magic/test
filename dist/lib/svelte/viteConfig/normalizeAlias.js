import is from '@magic/types'
import { normalizeSingleAlias } from './normalizeSingleAlias.js'
export const normalizeAlias = (alias, configDir) => {
  if (is.array(alias)) {
    return alias.map(a => normalizeSingleAlias(a, configDir))
  }
  if (is.object(alias)) {
    return Object.entries(alias).map(([find, replacement]) =>
      normalizeSingleAlias({ find, replacement }, configDir),
    )
  }
  return []
}
