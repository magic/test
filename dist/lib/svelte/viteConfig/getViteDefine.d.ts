/**
 * Get vite define variables for a source file
 * Times out after 3 seconds to avoid hanging in workers
 */
export declare const getViteDefine: () => Promise<Record<string, unknown>>
