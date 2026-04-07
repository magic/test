// Shim for $app/server
// Server-only exports - returns null/stubs in test environment

export function getRequestEvent(): null {
  return null
}

export function read(_asset: string): Response {
  return new Response('Not found', { status: 404 })
}

export function command(...args: any[]): any {
  console.warn('$app/server: command() is not available in test environment')
  return args[args.length - 1]
}

export function form(...args: any[]): any {
  console.warn('$app/server: form() is not available in test environment')
  return args[args.length - 1]
}

export function query(...args: any[]): any {
  console.warn('$app/server: query() is not available in test environment')
  return args[args.length - 1]
}

export function prerender(...args: any[]): any {
  console.warn('$app/server: prerender() is not available in test environment')
  return args[args.length - 1]
}

export function requested(_query: any, _limit?: number): any {
  console.warn('$app/server: requested() is not available in test environment')
  return {
    [Symbol.iterator]: () => ({
      next: () => ({ done: true, value: undefined }),
    }),
    refreshAll: async () => {},
  }
}

export const query$batch = {
  batch(...args: any[]): any {
    console.warn('$app/server: query.batch() is not available in test environment')
    return args[args.length - 1]
  },
}
