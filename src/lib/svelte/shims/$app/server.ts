// Shim for $app/server
// Server-only exports - returns null/stubs in test environment

export function getRequestEvent(): null {
  return null
}

export function read(_asset: string): Response {
  return new Response('Not found', { status: 404 })
}

export function command(...args: unknown[]): unknown {
  console.warn('$app/server: command() is not available in test environment')
  return args[args.length - 1]
}

export function form(...args: unknown[]): unknown {
  console.warn('$app/server: form() is not available in test environment')
  return args[args.length - 1]
}

export function query(...args: unknown[]): unknown {
  console.warn('$app/server: query() is not available in test environment')
  return args[args.length - 1]
}

export function prerender(...args: unknown[]): unknown {
  console.warn('$app/server: prerender() is not available in test environment')
  return args[args.length - 1]
}

export function requested(_query: unknown, _limit?: number): unknown {
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
