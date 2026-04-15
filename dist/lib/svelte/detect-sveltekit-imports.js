/**
 * Detect if a compiled Svelte component uses $app/* imports.
 */
export async function detectSvelteKitImports(compiledCode) {
  // Simple regex search for import from "$app/"
  const appImportRegex = /import\s+[^;]*\s+from\s+['"]\$app\/([^'"]+)['"]/g
  const result = {
    appState: false,
    appNavigation: false,
    appPaths: false,
    appEnvironment: false,
  }
  let match
  while ((match = appImportRegex.exec(compiledCode)) !== null) {
    const module = match[1] // e.g., "state", "navigation", "paths", "environment"
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
export function needsSvelteKitContext(detected) {
  return detected.appState || detected.appNavigation || detected.appPaths || detected.appEnvironment
}
