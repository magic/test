import is from '@magic/types'
import path from 'node:path'
import { escapeRegex } from './escapeRegex.js'
export const normalizeSingleAlias = (entry, configDir) => {
  const e = entry
  const find = e.find
  const replacement = e.replacement
  let findVal = is.string(find) || is.regex(find) ? find : String(find)
  let replacementVal = is.string(replacement) ? replacement : String(replacement)
  if (is.string(replacementVal) && !path.isAbsolute(replacementVal)) {
    replacementVal = path.resolve(configDir, replacementVal)
  }
  if (is.string(findVal)) {
    const regexMatch = findVal.match(/^\/(.+)\/([a-z]*)$/)
    if (regexMatch && regexMatch[1] && !is.undef(regexMatch[2])) {
      try {
        findVal = new RegExp(regexMatch[1], regexMatch[2])
      } catch {
        return { find: String(findVal), replacement: replacementVal }
      }
    }
    if (is.regex(findVal)) {
      return { find: findVal, replacement: replacementVal }
    }
    const findPrefix = findVal.endsWith('*') ? findVal.slice(0, -1) : findVal
    const replacementSuffix = replacementVal.endsWith('*')
      ? replacementVal.slice(0, -1)
      : replacementVal
    if (findVal.endsWith('*') && !findVal.startsWith('^')) {
      const regex = new RegExp(`^${escapeRegex(findPrefix)}(.*)`)
      return {
        find: regex,
        replacement: replacementSuffix + '$1',
      }
    }
    return { find: findVal, replacement: replacementVal }
  }
  if (is.regex(findVal)) {
    return { find: findVal, replacement: replacementVal }
  }
  return { find: String(findVal), replacement: replacementVal }
}
