import is from '@magic/types'
import { normalizeSingleAlias } from './normalizeSingleAlias.js'
export const normalizeAlias = (alias, configDir) => {
  if (is.array(alias)) {
    return alias.map(a => normalizeSingleAlias(a, configDir))
  }
  if (is.object(alias)) {
    const obj = alias
    // Single-alias object form: { find, replacement }
    if ('find' in obj && 'replacement' in obj) {
      return [normalizeSingleAlias(obj, configDir)]
    }
    // Map form: { [find]: replacement }
    return Object.entries(obj).map(([find, replacement]) =>
      normalizeSingleAlias({ find, replacement }, configDir),
    )
  }
  return []
}
//# sourceMappingURL=normalizeAlias.js.map
