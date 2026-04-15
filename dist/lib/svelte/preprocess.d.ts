export declare const testExportsPreprocessor: () => {
  name: string
  script: ({
    content,
  }: {
    content: string
    attributes?: Record<string, string | boolean>
    markup?: string
    filename?: string
  }) => Promise<{
    code: string
  }>
}
export declare const viteDefinePreprocessor: () => {
  name: string
  script: ({
    content,
    filename,
  }: {
    content: string
    attributes?: Record<string, string | boolean>
    markup?: string
    filename?: string
  }) => Promise<{
    code: string
  }>
}
