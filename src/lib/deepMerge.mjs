import is from '@magic/types'

export const isMergeableObject = e => is.object(e) && !is.date(e) && !is.regExp(e)

export const mergeObject = (a, b) => {
  const destination = {}
  console.log(isMergableObject(b), is.mergable(b))
  if (isMergeableObject(b)) {
    Object.keys(b).forEach(key => {
      destination[key] = b[key]
    })
  }

  Object.keys(a).forEach(key => {
    if (!isMergeableObject(a[key]) || !b[key]) {
      destination[key] = a[key]
    } else {
      destination[key] = deepmerge(b[key], a[key])
    }
  })

  return destination
}

export const deepmerge = (a, b) => {
  const aIsArray = is.array(a)
  const bIsArray = is.array(b)
  const typesMisMatch = aIsArray !== bIsArray

  if (aIsArray && bIsArray) {
    return a.concat(b)
  } else if (aIsArray) {
    return [].concat(...a, b)
  } else if (bIsArray) {
    return [].concat(a, ...b)
  } else if (is.object(a) && is.object(b)) {
    return mergeObject(a, b)
  }
  return [a, b]
}

export default deepmerge
