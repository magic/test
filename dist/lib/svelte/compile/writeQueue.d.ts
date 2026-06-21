declare class WriteQueue {
  private pendingWrites
  private flushPromise
  private readonly batchSize
  private readonly flushInterval
  private lastFlush
  constructor(batchSize?: number, flushIntervalMs?: number)
  write(filePath: string, content: string): Promise<string>
  /**
   * Eagerly flush writes for a specific file path.
   * Call this before returning import URLs to ensure file exists.
   */
  flushPath(filePath: string): Promise<void>
  /**
   * Flush all pending writes to disk in parallel
   */
  flush(): Promise<void>
  get pendingCount(): number
}
export declare const writeQueue: WriteQueue
export {}
