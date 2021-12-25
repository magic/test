import is from '@magic/types'

export const stringify = object => {
  if (is.string(object)) {
    return object.slice(0, 20)
  }
  if (is.function(object)) {
    return object.toString()
  } else if (is.array(object)) {
    return object.map(stringify)
  } else if (is.objectNative(object)) {
    Object.entries(object).map(([k, v]) => {
      object[k] = stringify(v)
    })
  }

  return object
}
