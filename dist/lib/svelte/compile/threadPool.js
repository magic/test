import os from 'node:os'
import { Worker } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
// Get worker script path
const workerPath = join(dirname(fileURLToPath(import.meta.url)), 'compileWorker.js')
class CompileThreadPool {
  workers = []
  queue = []
  size
  readyWorkers = 0
  constructor(size) {
    // Default to CPU cores - 1, minimum 1
    const defaultSize = Math.max(1, (os.cpus().length || 4) - 1)
    this.size = size ?? defaultSize
    this.initWorkers()
  }
  initWorkers() {
    for (let i = 0; i < this.size; i++) {
      const worker = new Worker(workerPath)
      worker.on('message', msg => {
        if (msg.id === -1) {
          // Ready signal
          this.readyWorkers++
          this.processQueue()
          return
        }
        // Find and resolve the first pending task
        const taskIndex = this.queue.findIndex(() => true)
        if (taskIndex !== -1) {
          const task = this.queue[taskIndex]
          this.queue.splice(taskIndex, 1)
          if (msg.error) {
            task?.reject(new Error(msg.error))
          } else if (msg.result) {
            task?.resolve(msg.result)
          }
        }
        // Mark worker as available
        const workerState = this.workers.find(w => w.worker === worker)
        if (workerState) {
          workerState.busy = false
        }
        // Process next task
        this.processQueue()
      })
      worker.on('error', err => {
        console.error('Worker error:', err)
      })
      worker.on('exit', code => {
        if (code !== 0) {
          console.warn(`Worker exited with code ${code}`)
        }
      })
      this.workers.push({ worker, busy: false })
    }
  }
  processQueue() {
    if (this.queue.length === 0) return
    // Find an available worker
    const availableWorker = this.workers.find(w => !w.busy)
    if (!availableWorker) return
    const task = this.queue.shift()
    if (!task) return
    availableWorker.busy = true
    availableWorker.worker.postMessage({
      id: Date.now(),
      filePath: task.filePath,
    })
  }
  async compile(filePath) {
    return new Promise((resolve, reject) => {
      this.queue.push({ filePath, resolve, reject })
      this.processQueue()
    })
  }
  async terminate() {
    await Promise.all(this.workers.map(({ worker }) => worker.terminate()))
    this.workers = []
  }
  get pending() {
    return this.queue.length
  }
  get totalWorkers() {
    return this.size
  }
  get ready() {
    return this.readyWorkers
  }
}
// Singleton instance
export const compileThreadPool = new CompileThreadPool()
