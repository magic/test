export const getTestKey = (pkg, parent, name) => {
  let key = ''
  let parentKey = parent
  let testName = name
  if (parentKey && parentKey !== pkg) {
    key = `${pkg}`
  }
  if (parentKey && parentKey !== testName) {
    if (!parentKey.startsWith('/') && parentKey !== pkg) {
      parentKey = `.${parentKey}`
    }
    key += `${parentKey}`
  }
  if (testName) {
    if (parentKey && parentKey !== testName && parentKey !== pkg && !testName.startsWith('/')) {
      key += '#'
    } else if (!testName.startsWith('/')) {
      testName = `/${testName}`
    }
    key += testName
  }
  return key
}
//# sourceMappingURL=getTestKey.js.map
