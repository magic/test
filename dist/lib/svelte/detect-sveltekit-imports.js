import { extractImportsSync } from './compile/astParse.js'
/**
 * Match a $app/* import specifier. Handles both the raw form (`$app/state`)
 * and the form rewritten by processImports to the shim file URL
 * (`.../shims/$app/state.js`) — detection runs on the compiled output, where
 * the raw specifiers no longer exist.
 */
const matchAppModule = source => {
  if (source.startsWith('$app/')) {
    return source.slice(5)
  }
  const m = /shims\/\$app\/(state|navigation|paths|environment)(\.js)?$/.exec(source)
  return m?.[1] ?? null
}
/**
 * Detect if a compiled Svelte component uses $app/* imports.
 */
export const detectSvelteKitImports = async compiledCode => {
  // Use AST-based import extraction
  const imports = extractImportsSync(compiledCode)
  const result = {
    appState: false,
    appNavigation: false,
    appPaths: false,
    appEnvironment: false,
  }
  for (const imp of imports) {
    const module = matchAppModule(imp.source)
    if (module === null) {
      continue
    }
    switch (module) {
      case 'state':
        result.appState = true
        break
      case 'navigation':
        result.appNavigation = true
        break
      case 'paths':
        result.appPaths = true
        break
      case 'environment':
        result.appEnvironment = true
        break
    }
  }
  return result
}
/**
 * Determine if a component needs SvelteKit test context.
 */
export const needsSvelteKitContext = detected => {
  return detected.appState || detected.appNavigation || detected.appPaths || detected.appEnvironment
}
//# sourceMappingURL=detect-sveltekit-imports.js.map
