export declare const WORKER_LIMIT: number
export declare const getWorkerPool: (limit?: number) => <T>(fn: () => Promise<T>) => Promise<T>
