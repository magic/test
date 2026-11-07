type PromiseResult<T> = {
  status: 'fulfilled' | 'rejected'
  value?: T
  reason?: unknown
}
export declare const limitedPromiseAllSettled: <T>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<unknown>,
) => Promise<PromiseResult<T>[]>
export {}
