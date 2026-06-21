declare class WriteQueue {
  private queue
  private processing
  private batchSize
  private batchDelay
  write(path: string, content: string): Promise<string>
  private scheduleProcess
  private processBatch
  flush(): Promise<void>
  get pending(): number
}
export declare const writeQueue: WriteQueue
export {}
