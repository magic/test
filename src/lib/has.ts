import is from '@magic/types'

type Predicate = (value: unknown) => boolean
type Check = Predicate | unknown

const isPredicate = (check: Check): check is Predicate => is.function(check)

const checkValue = (value: unknown, check: Check): boolean => {
  if (isPredicate(check)) {
    return check(value)
  }
  return is.deep.equal(value, check)
}

export const property = (key: string, check: Check) => {
  return (result: unknown): boolean => {
    if (result === null || !is.object(result)) {
      return false
    }
    const value = (result as Record<string, unknown>)[key]
    return checkValue(value, check)
  }
}

export const properties = (spec: Record<string, Check>) => {
  return (result: unknown): boolean => {
    if (result === null || !is.object(result)) {
      return false
    }

    for (const [key, check] of Object.entries(spec)) {
      if (!(key in result)) {
        return false
      }
      if (!checkValue((result as Record<string, unknown>)[key], check)) {
        return false
      }
    }
    return true
  }
}

export const any = (spec: Record<string, Check>) => {
  return (result: unknown): boolean => {
    if (result === null || !is.object(result)) {
      return false
    }

    for (const [key, check] of Object.entries(spec)) {
      if (key in result && checkValue((result as Record<string, unknown>)[key], check)) {
        return true
      }
    }
    return false
  }
}

export const nested = (path: string, predicate: Predicate) => {
  const pathKeys = path.split('.')

  return (result: unknown): boolean => {
    let current: unknown = result

    for (const key of pathKeys) {
      if (current === null || !is.object(current) || !(key in current)) {
        return false
      }
      current = (current as Record<string, unknown>)[key]
    }

    return predicate(current)
  }
}

export const string = (substring: string) => {
  return (result: unknown): boolean => {
    return is.string(result) && result.includes(substring)
  }
}

export const at = (index: number, check: Check) => {
  return (result: unknown): boolean => {
    if (!is.array(result)) {
      return false
    }
    const value = result[index]
    return checkValue(value, check)
  }
}

export const key = (keyName: string) => {
  return (result: unknown): boolean => {
    if (result === null || !is.object(result)) {
      return false
    }
    return keyName in result
  }
}

export const keys = (keyNames: string[]) => {
  return (result: unknown): boolean => {
    if (result === null || !is.object(result)) {
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

export const includes = (item: unknown) => {
  return (result: unknown): boolean => {
    if (is.array(result)) {
      return result.some(v => is.deep.equal(v, item))
    }
    if (is.string(result) && is.string(item)) {
      return result.includes(item)
    }
    return false
  }
}

export const oneOf = (options: unknown[]) => {
  return (result: unknown): boolean => {
    return options.some(opt => is.deep.equal(result, opt))
  }
}

export const matches = (pattern: RegExp) => {
  return (result: unknown): boolean => {
    return is.string(result) && pattern.test(result)
  }
}

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
