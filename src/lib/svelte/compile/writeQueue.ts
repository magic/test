import fs from '@magic/fs'
import path from 'node:path'

// Parallel write queue - simple synchronous writes for now

interface WriteRequest {
  path: string
  content: string
  resolve: (path: string) => void
  reject: (err: Error) => void
}

class WriteQueue {
  private queue: WriteRequest[] = []
  private running = 0
  private readonly maxConcurrent: number

  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent
  }

  async write(filePath: string, content: string): Promise<string> {
    // Simple synchronous approach for now
    // Parallel writes would require batching at a higher level
    await fs.mkdirp(path.dirname(filePath))
    await fs.writeFile(filePath, content)
    return filePath
  }

  async flush(): Promise<void> {
    // Nothing to flush - writes are synchronous
  }

  get pendingCount(): number {
    return 0
  }
}

// Singleton instance
export const writeQueue = new WriteQueue()
