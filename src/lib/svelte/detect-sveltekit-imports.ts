import { extractImportsSync } from './compile/astParse.ts'

/**
 * Detect if a compiled Svelte component uses $app/* imports.
 */
export const detectSvelteKitImports = async (
  compiledCode: string,
): Promise<{
  appState: boolean
  appNavigation: boolean
  appEnvironment: boolean
  appPaths: boolean
}> => {
  // Use AST-based import extraction
  const imports = extractImportsSync(compiledCode)

  const result = {
    appState: false,
    appNavigation: false,
    appPaths: false,
    appEnvironment: false,
  }

  for (const imp of imports) {
    if (imp.source.startsWith('$app/')) {
      // Extract module name from "$app/module"
      const module = imp.source.slice(5) // Remove "$app/" prefix
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
  }

  return result
}

/**
 * Determine if a component needs SvelteKit test context.
 */
export const needsSvelteKitContext = (detected: {
  appState: boolean
  appNavigation: boolean
  appPaths: boolean
  appEnvironment: boolean
}): boolean => {
  return detected.appState || detected.appNavigation || detected.appPaths || detected.appEnvironment
}
