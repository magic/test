/**
 * Resolve Vite/SvelteKit aliases ($lib, $app, $env, etc.)
 * This is called from compile.ts for non-relative imports
 */
export declare const resolveViteAlias: (
  importPath: string,
  sourceFilePath: string,
) => Promise<string | null>
