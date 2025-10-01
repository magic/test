/**
 *
 * @param {string} [pkg]
 * @param {string} [parent]
 * @param {string} [name]
 * @returns
 */
export const getTestKey = (pkg, parent, name) => {
  let key = ''
  if (parent && parent !== pkg) {
    key = `${pkg}`
  }
  if (parent && parent !== name) {
    if (!parent.startsWith('/') && parent !== pkg) {
      parent = `.${parent}`
    }
    key += `${parent}`
  }

  if (name) {
    if (parent && parent !== name && parent !== pkg && !name.startsWith('/')) {
      key += '#'
    } else if (!name.startsWith('/')) {
      name = `/${name}`
    }

    key += name
  }
  return key
}
