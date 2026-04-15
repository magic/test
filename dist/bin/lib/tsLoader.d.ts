export declare function resolve(
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
  shortCircuit?: boolean
}>
export declare function load(
  url: string,
  context: {
    format?: string
  },
  nextLoad: (
    url: string,
    context?: object,
  ) => Promise<{
    format?: string
    source?: string
  }>,
): Promise<{
  format?: string
  source?: string
  shortCircuit?: boolean
}>
