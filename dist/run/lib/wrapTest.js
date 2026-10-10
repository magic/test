/* ---------------------------------------------------------------------------
 * Wrap a test with suite metadata
 * -------------------------------------------------------------------------- */
export const wrapTest = (t, name, parent, pkg) => ({
  ...t,
  name,
  parent,
  pkg,
})
//# sourceMappingURL=wrapTest.js.map
