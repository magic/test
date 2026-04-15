export declare function getRequestEvent(): null
export declare function read(_asset: string): Response
export declare function command(...args: unknown[]): unknown
export declare function form(...args: unknown[]): unknown
export declare function query(...args: unknown[]): unknown
export declare function prerender(...args: unknown[]): unknown
export declare function requested(_query: unknown, _limit?: number): unknown
export declare const query$batch: {
  batch(...args: unknown[]): unknown
}
