let svelte = null
export async function ensureSvelte() {
  if (!svelte) {
    try {
      svelte = await import('svelte')
    } catch {
      throw new Error('svelte not installed. Run: npm install svelte')
    }
  }
  return svelte
}
export * from './lib/svelte/index.js'
