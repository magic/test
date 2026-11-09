// Shim for $app/server
// Server-only exports - returns null/stubs in test environment
export const getRequestEvent = () => null
export const read = _asset => new Response('Not found', { status: 404 })
export const command = (...args) => {
  console.warn('$app/server: command() is not available in test environment')
  return args[args.length - 1]
}
export const form = (...args) => {
  console.warn('$app/server: form() is not available in test environment')
  return args[args.length - 1]
}
export const query = (...args) => {
  console.warn('$app/server: query() is not available in test environment')
  return args[args.length - 1]
}
export const prerender = (...args) => {
  console.warn('$app/server: prerender() is not available in test environment')
  return args[args.length - 1]
}
export const requested = (_query, _limit) => {
  console.warn('$app/server: requested() is not available in test environment')
  return {
    [Symbol.iterator]: () => ({
      next: () => ({ done: true, value: undefined }),
    }),
    refreshAll: async () => {},
  }
}
export const query$batch = {
  batch(...args) {
    console.warn('$app/server: query.batch() is not available in test environment')
    return args[args.length - 1]
  },
}
//# sourceMappingURL=server.js.map
