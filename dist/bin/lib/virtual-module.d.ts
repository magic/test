/**
 * Empty module used as a fallback for `virtual:` scheme imports.
 * Vite/paraglide generate virtual modules via `virtual:paraglide/<hash>/...`;
 * the Node ESM loader cannot resolve those URLs, so we serve this placeholder.
 */
export declare const handleVirtualModule: (_specifier: string) => Promise<{
  url: string
  shortCircuit: boolean
}>
