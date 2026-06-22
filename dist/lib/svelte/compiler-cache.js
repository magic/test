// Pre-import cache for svelte/compiler to avoid repeated dynamic imports
let svelteCompiler = null
let loadError = null
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
