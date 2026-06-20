export type SvelteExport = {
  name: string
  path: string
  isDefaultReexport?: boolean
}
export declare const getSvelteExports: (filePath: string) => Promise<SvelteExport[]>
