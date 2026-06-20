// Pre-import cache for svelte/compiler to avoid repeated dynamic imports
let svelteCompiler = null
export const getSvelteCompiler = async () => {
  if (!svelteCompiler) {
    svelteCompiler = await import('svelte/compiler')
  }
  return svelteCompiler
}
// Pre-warm the cache
getSvelteCompiler()
