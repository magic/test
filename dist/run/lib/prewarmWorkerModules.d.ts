/**
 * Import the compiled module of each referenced component (no mount). Warms
 * the worker's module graph + compile caches so the first real mount is fast.
 */
export declare const prewarmWorkerModules: (tests: unknown) => Promise<void>
