export declare function statCached(filePath: string): Promise<{
  exists: boolean
  mtime?: number
  size?: number
}>
export declare function existsCached(filePath: string): Promise<boolean>
export declare function clearPathCache(): void
