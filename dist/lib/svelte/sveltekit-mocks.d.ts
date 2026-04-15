type PageProxy = {
  url: URL
  params: Record<string, unknown>
  state: Record<string, unknown>
}
/**
 * Create a static page object that mimics $app/state page
 */
export declare const createStaticPage: (initialData?: {
  url?: string
  params?: object
  state?: object
}) => PageProxy
export declare const browser = true
export declare const dev: boolean
export declare const prod: boolean
export declare const platform = 'node'
export {}
