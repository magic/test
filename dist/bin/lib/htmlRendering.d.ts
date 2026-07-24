/**
 * Decode common HTML entities used by @magic/core's renderToString.
 * Takes a rendered HTML string and converts entities back to chars.
 * Pure function: no I/O, deterministic.
 */
export declare const decodeHtmlEntities: (html: string) => string
/**
 * Build a renderString wrapper that decodes HTML entities from renderToString.
 * Used by maybeInjectMagic to wrap @magic/module functions.
 * @param renderToString - The render function from @magic/core
 * @returns A function that renders views and decodes HTML entities
 */
export declare const createRenderString: (
  renderToString: (view: unknown) => string,
) => (fn: (...args: unknown[]) => unknown) => (...args: unknown[]) => string
