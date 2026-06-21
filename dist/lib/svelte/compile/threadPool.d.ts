interface CompileResult {
  js: string
  css: unknown | null
}
declare class CompileThreadPool {
  private workers
  private queue
  private readonly size
  private readyWorkers
  constructor(size?: number)
  private initWorkers
  private processQueue
  compile(filePath: string): Promise<CompileResult>
  terminate(): Promise<void>
  get pending(): number
  get totalWorkers(): number
  get ready(): number
}
export declare const compileThreadPool: CompileThreadPool
export {}
