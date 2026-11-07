type SpecValue = unknown
type LibTestResult = {
  fn: boolean
  info: string
}
export declare const test: (
  lib?: Record<string, unknown>,
  spec?: Record<string, SpecValue>,
  parent?: string,
) => Array<LibTestResult | LibTestResult[]>
export declare const version: (
  lib: Record<string, unknown>,
  spec: Record<string, unknown>,
  parent?: string,
) => LibTestResult[]
export {}
