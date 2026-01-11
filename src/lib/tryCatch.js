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
      return await fn(...args)
    } catch (e) {
      return e
    }
  }
