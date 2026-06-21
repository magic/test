export declare const MAX_CONCURRENT = 5
export declare function parallelMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency?: number,
): Promise<R[]>
