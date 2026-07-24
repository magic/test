import is from '@magic/types'

/**
 * Decode HTML entities that @magic/core's renderToString produces.
 * Pure function: only string manipulation.
 */
const htmlEntityMap: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
}

const entityRe = /&lt;|&gt;|&quot;/g

/**
 * Decode common HTML entities used by @magic/core's renderToString.
 * Takes a rendered HTML string and converts entities back to chars.
 * Pure function: no I/O, deterministic.
 */
export const decodeHtmlEntities = (html: string): string =>
  html.replace(entityRe, match => htmlEntityMap[match] || match)

/**
 * Build a renderString wrapper that decodes HTML entities from renderToString.
 * Used by maybeInjectMagic to wrap @magic/module functions.
 * @param renderToString - The render function from @magic/core
 * @returns A function that renders views and decodes HTML entities
 */
export const createRenderString = (
  renderToString: (view: unknown) => string,
): ((fn: (...args: unknown[]) => unknown) => (...args: unknown[]) => string) => {
  return (fn: (...args: unknown[]) => unknown) => {
    return (...args: unknown[]) => {
      const view =
        'View' in fn && is.fn(fn.View)
          ? (fn.View as (...args: unknown[]) => unknown)(...args)
          : (fn as (...args: unknown[]) => unknown)(...args)
      return decodeHtmlEntities(renderToString(view))
    }
  }
}
