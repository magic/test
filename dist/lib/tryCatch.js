export const tryCatch =
  (fn, ...args) =>
  async () => {
    try {
      return await fn(...args)
    } catch (e) {
      return e
    }
  }
