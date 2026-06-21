import fs from '@magic/fs'
import path from 'node:path'
class WriteQueue {
  queue = new Map()
  processing = false
  batchSize = 10
  batchDelay = 3 // ms - small delay to batch nearby writes
  async write(path, content) {
    return new Promise((resolve, reject) => {
      this.queue.set(path, { path, content, resolve, reject })
      this.scheduleProcess()
    })
  }
  scheduleProcess() {
    if (this.processing) return
    this.processing = true
    // Small delay to accumulate nearby writes
    setTimeout(async () => {
      await this.processBatch()
      this.processing = false
      if (this.queue.size > 0) {
        this.scheduleProcess()
      }
    }, this.batchDelay)
  }
  async processBatch() {
    const entries = [...this.queue.entries()].slice(0, this.batchSize)
    if (entries.length === 0) return
    const promises = entries.map(async ([_path, req]) => {
      try {
        await fs.mkdirp(path.dirname(req.path))
        await fs.writeFile(req.path, req.content)
        req.resolve(req.path)
      } catch (e) {
        req.reject(e)
      }
    })
    await Promise.all(promises)
    // Remove processed entries
    for (const path of entries.map(([p]) => p)) {
      this.queue.delete(path)
    }
  }
  // Flush all pending writes and wait for completion
  async flush() {
    while (this.queue.size > 0) {
      this.processing = true
      await this.processBatch()
      this.processing = false
    }
  }
  get pending() {
    return this.queue.size
  }
}
// Singleton instance
export const writeQueue = new WriteQueue()
