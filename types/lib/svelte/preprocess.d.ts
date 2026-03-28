export function testExportsPreprocessor(): {
  name: string
  /** @param {{ content: string }} params */
  script: ({ content }: { content: string }) => Promise<{
    code: string
  }>
}
export function sveltekitMocksPreprocessor(): {
  name: string
  /** @param {{ content: string }} params */
  script: ({ content }: { content: string }) => Promise<{
    code: string
  }>
}
export type ASTNode = {
  [key: string]: unknown
  type: string
}
//# sourceMappingURL=preprocess.d.ts.map
