/**
 *
 * @param {(...args: unknown[]) => unknown} fn
 * @param  {...unknown} args
 * @returns
 */
export const tryCatch =
  (fn, ...args) =>
  async () => {
    try {
      if (args.length === 0) {
        return await fn()
      }

      return await fn(...args)
    } catch (e) {
      return e
    }
  }
