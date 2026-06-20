// Pre-import cache for @typescript-eslint/parser to avoid repeated dynamic imports
let parser = null
export const getParser = async () => {
  if (!parser) {
    parser = await import('@typescript-eslint/parser')
  }
  return parser
}
// Pre-warm the cache
getParser()
