import is from '@magic/types'
const isPredicate = check => is.function(check)
const checkValue = (value, check) => {
  if (isPredicate(check)) {
    return check(value)
  }
  return is.deep.equal(value, check)
}
export const property = (key, check) => {
  return result => {
    if (is.null(result) || !is.object(result)) {
      return false
    }
    const value = result[key]
    return checkValue(value, check)
  }
}
export const properties = spec => {
  return result => {
    if (is.null(result) || !is.object(result)) {
      return false
    }
    for (const [key, check] of Object.entries(spec)) {
      if (!(key in result)) {
        return false
      }
      if (!checkValue(result[key], check)) {
        return false
      }
    }
    return true
  }
}
export const any = spec => {
  return result => {
    if (is.null(result) || !is.object(result)) {
      return false
    }
    for (const [key, check] of Object.entries(spec)) {
      if (key in result && checkValue(result[key], check)) {
        return true
      }
    }
    return false
  }
}
export const nested = (path, predicate) => {
  const pathKeys = path.split('.')
  return result => {
    let current = result
    for (const key of pathKeys) {
      if (current === null || !is.object(current) || !(key in current)) {
        return false
      }
      current = current[key]
    }
    return predicate(current)
  }
}
export const string = substring => {
  return result => {
    return is.string(result) && result.includes(substring)
  }
}
export const at = (index, check) => {
  return result => {
    if (!is.array(result)) {
      return false
    }
    const value = result[index]
    return checkValue(value, check)
  }
}
export const key = keyName => {
  return result => {
    if (is.null(result) || !is.object(result)) {
      return false
    }
    return keyName in result
  }
}
export const keys = keyNames => {
  return result => {
    if (is.null(result) || !is.object(result)) {
      return false
    }
    for (const keyName of keyNames) {
      if (!(keyName in result)) {
        return false
      }
    }
    return true
  }
}
export const includes = item => result => {
  if (is.array(result)) {
    return result.some(v => is.deep.equal(v, item))
  }
  if (is.string(result) && is.string(item)) {
    return result.includes(item)
  }
  return false
}
export const oneOf = options => result => options.some(opt => is.deep.equal(result, opt))
export const matches = pattern => result => is.string(result) && pattern.test(result)
export const has = {
  property,
  properties,
  any,
  nested,
  string,
  at,
  key,
  keys,
  includes,
  oneOf,
  matches,
}
