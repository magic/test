export function resolve(
  specifier: string,
  context: {
    parentURL?: string
  },
  nextResolve: (
    specifier: string,
    context?: object,
  ) => Promise<{
    url: string
  }>,
): Promise<{
  url: string
}>
//# sourceMappingURL=tsLoader.d.ts.map
