export function resolve(
  specifier: string,
  context: {
    conditions: string[]
    importAttributes: Record<string, string>
    parentURL: string | undefined
  },
  nextResolve: (
    specifier: string,
    context: any,
  ) => Promise<{
    url: string
    format?: string
    shortCircuit?: boolean
  }>,
): Promise<{
  url: string
  format?: string
  shortCircuit?: boolean
}>
//# sourceMappingURL=tsLoader.d.ts.map
