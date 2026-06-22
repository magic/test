// Pre-import cache for svelte/compiler to avoid repeated dynamic imports

let svelteCompiler: typeof import('svelte/compiler') | null = null
let loadError: Error | null = null

export const getSvelteCompiler = async () => {
  if (loadError) {
    throw loadError
  }
  if (!svelteCompiler) {
    try {
      svelteCompiler = await import('svelte/compiler')
    } catch {
      loadError = new Error('svelte not installed. Run: npm install svelte')
      throw loadError
    }
  }
  return svelteCompiler
}
