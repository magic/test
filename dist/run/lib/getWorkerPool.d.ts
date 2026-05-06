export declare const WORKER_LIMIT: number
export declare const getWorkerPool: () => <T>(fn: () => Promise<T>) => Promise<T>
