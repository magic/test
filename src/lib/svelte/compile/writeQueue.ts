import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Batched write queue with eager flush support

interface WriteRequest {
  path: string
  content: string
}

class WriteQueue {
  private pendingWrites = new Map<string, WriteRequest>()
  private flushPromise: Promise<void> | null = null
  private readonly batchSize: number
  private readonly flushInterval: number
  private lastFlush = Date.now()

  constructor(batchSize = 50, flushIntervalMs = 10) {
    this.batchSize = batchSize
    this.flushInterval = flushIntervalMs
  }

  async write(filePath: string, content: string): Promise<string> {
    // Add to pending batch
    this.pendingWrites.set(filePath, { path: filePath, content })

    // Flush if batch is full or enough time has passed
    const shouldFlush =
      this.pendingWrites.size >= this.batchSize || Date.now() - this.lastFlush >= this.flushInterval

    if (shouldFlush) {
      await this.flush()
    }

    return filePath
  }

  /**
   * Eagerly flush writes for a specific file path.
   * Call this before returning import URLs to ensure file exists.
   */
  async flushPath(filePath: string): Promise<void> {
    const request = this.pendingWrites.get(filePath)
    if (request) {
      this.pendingWrites.delete(filePath)
      await mkdir(path.dirname(request.path), { recursive: true })
      await writeFile(request.path, request.content)
    }
  }

  /**
   * Flush all pending writes to disk in parallel
   */
  async flush(): Promise<void> {
    if (this.pendingWrites.size === 0) {
      return
    }

    // If already flushing, wait for it
    if (this.flushPromise) {
      await this.flushPromise
      return
    }

    this.flushPromise = (async () => {
      const writes = [...this.pendingWrites.values()]
      this.pendingWrites.clear()
      this.lastFlush = Date.now()

      // Write all files in parallel
      await Promise.all(
        writes.map(async w => {
          await mkdir(path.dirname(w.path), { recursive: true })
          await writeFile(w.path, w.content)
        }),
      )

      this.flushPromise = null
    })()

    await this.flushPromise
  }

  get pendingCount(): number {
    return this.pendingWrites.size
  }
}

// Singleton instance
export const writeQueue = new WriteQueue()
