export declare const getRequestEvent: () => null
export declare const read: (_asset: string) => Response
export declare const command: (...args: unknown[]) => unknown
export declare const form: (...args: unknown[]) => unknown
export declare const query: (...args: unknown[]) => unknown
export declare const prerender: (...args: unknown[]) => unknown
export declare const requested: (_query: unknown, _limit?: number) => unknown
export declare const query$batch: {
  batch(...args: unknown[]): unknown
}
