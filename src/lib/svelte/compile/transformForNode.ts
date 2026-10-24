import path from 'node:path'

export const transformForNode = (code: string, filePath: string): string => {
  const componentName = path.basename(filePath, '.svelte')
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '_') + '$$component'

  // Svelte emits the anonymous component as `function _unknown_(…)` when it
  // can't infer a name. Only replace the STANDALONE identifier — a naive
  // global replace corrupts user code that merely contains the substring
  // `_unknown_` (e.g. i18n keys like `m.sk_auth_login_unknown_user()`).
  const transformed = code.replace(/\b_unknown_\b/g, safeName)

  return transformed
}
