export function limitedPromiseAllSettled<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<unknown>,
): Promise<
  Array<{
    status: 'fulfilled' | 'rejected'
    value?: unknown
    reason?: unknown
  }>
>
//# sourceMappingURL=limitedPromiseAllSettled.d.ts.map
