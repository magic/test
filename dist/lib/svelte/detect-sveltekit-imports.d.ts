/**
 * Detect if a compiled Svelte component uses $app/* imports.
 */
export declare function detectSvelteKitImports(compiledCode: string): Promise<{
  appState: boolean
  appNavigation: boolean
  appEnvironment: boolean
  appPaths: boolean
}>
/**
 * Determine if a component needs SvelteKit test context.
 */
export declare function needsSvelteKitContext(detected: {
  appState: boolean
  appNavigation: boolean
  appPaths: boolean
  appEnvironment: boolean
}): boolean
