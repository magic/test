let svelte: typeof import('svelte') | null = null

export const ensureSvelte = async () => {
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
