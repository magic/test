declare class WriteQueue {
  private queue
  private running
  private readonly maxConcurrent
  constructor(maxConcurrent?: number)
  write(filePath: string, content: string): Promise<string>
  flush(): Promise<void>
  get pendingCount(): number
}
export declare const writeQueue: WriteQueue
export {}
