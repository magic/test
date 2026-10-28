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
    if (is.null(result) || !is.object(result)) {
      return false
    }
    const value = (result as Record<string, unknown>)[key]
    return checkValue(value, check)
  }
}

export const properties = (spec: Record<string, Check>) => {
  return (result: unknown): boolean => {
    if (is.null(result) || !is.object(result)) {
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
    if (is.null(result) || !is.object(result)) {
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

export const nested = (path: string, check: Check) => {
  const pathKeys = path.split('.')

  return (result: unknown): boolean => {
    let current: unknown = result

    for (const key of pathKeys) {
      if (current === null || !is.object(current) || !(key in current)) {
        return false
      }
      current = (current as Record<string, unknown>)[key]
    }

    return checkValue(current, check)
  }
}

type StringCheck = string | ((value: string) => boolean)

export const string = (...substring: StringCheck[]) => {
  return (result: unknown): boolean => {
    if (!is.string(result)) {
      return false
    }

    return substring.every(str => {
      if (is.function(str)) {
        return str(result)
      }
      return result.includes(str)
    })
  }
}

export const at = (index: number, check: Check | Check[]) => {
  return (result: unknown): boolean => {
    if (!is.array(result)) {
      return false
    }
    const value = result[index]
    // An array of checks must all pass against the element; a single
    // non-array check behaves as before.
    if (is.array(check)) {
      return check.every(c => checkValue(value, c))
    }
    return checkValue(value, check)
  }
}

export const key = (keyName: string) => {
  return (result: unknown): boolean => {
    if (is.null(result) || !is.object(result)) {
      return false
    }
    return keyName in result
  }
}

export const keys = (keyNames: string[]) => {
  return (result: unknown): boolean => {
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

export const includes =
  (...items: unknown[]) =>
  (result: unknown): boolean => {
    return items.every(item => {
      if (is.array(result)) {
        return result.some(v => (is.function(item) ? item(v) : is.deep.equal(v, item)))
      }
      if (is.string(result) && is.string(item)) {
        return result.includes(item)
      }
      return false
    })
  }

export const oneOf =
  (...options: unknown[]) =>
  (result: unknown): boolean => {
    if (options.length === 1 && is.array(options[0])) {
      return oneOf(...options[0])(result)
    }

    return options.some(opt => is.deep.equal(result, opt))
  }

export const matches =
  (pattern: RegExp) =>
  (result: unknown): boolean =>
    is.string(result) && pattern.test(result)

const negate =
  <Args extends unknown[]>(fn: (...args: Args) => (result: unknown) => boolean) =>
  (...args: Args): ((result: unknown) => boolean) =>
  (result: unknown): boolean =>
    !fn(...args)(result)

export const not = {
  property: negate(property),
  properties: negate(properties),
  any: negate(any),
  nested: negate(nested),
  string: negate(string),
  at: negate(at),
  key: negate(key),
  keys: negate(keys),
  includes: negate(includes),
  oneOf: negate(oneOf),
  matches: negate(matches),
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
  not,
}
