// Shim for $app/server
// Server-only exports - returns null/stubs in test environment

export const getRequestEvent = (): null => null

export const read = (_asset: string): Response => new Response('Not found', { status: 404 })

export const command = (...args: unknown[]): unknown => {
  console.warn('$app/server: command() is not available in test environment')
  return args[args.length - 1]
}

export const form = (...args: unknown[]): unknown => {
  console.warn('$app/server: form() is not available in test environment')
  return args[args.length - 1]
}

export const query = (...args: unknown[]): unknown => {
  console.warn('$app/server: query() is not available in test environment')
  return args[args.length - 1]
}

export const prerender = (...args: unknown[]): unknown => {
  console.warn('$app/server: prerender() is not available in test environment')
  return args[args.length - 1]
}

export const requested = (_query: unknown, _limit?: number): unknown => {
  console.warn('$app/server: requested() is not available in test environment')
  return {
    [Symbol.iterator]: () => ({
      next: () => ({ done: true, value: undefined }),
    }),
    refreshAll: async () => {},
  }
}

export const query$batch = {
  batch(...args: unknown[]): unknown {
    console.warn('$app/server: query.batch() is not available in test environment')
    return args[args.length - 1]
  },
}
