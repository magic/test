type Predicate = (value: unknown) => boolean
type Check = Predicate | unknown
export declare const property: (key: string, check: Check) => (result: unknown) => boolean
export declare const properties: (spec: Record<string, Check>) => (result: unknown) => boolean
export declare const any: (spec: Record<string, Check>) => (result: unknown) => boolean
export declare const nested: (path: string, predicate: Predicate) => (result: unknown) => boolean
export declare const string: (substring: string) => (result: unknown) => boolean
export declare const at: (index: number, check: Check) => (result: unknown) => boolean
export declare const key: (keyName: string) => (result: unknown) => boolean
export declare const keys: (keyNames: string[]) => (result: unknown) => boolean
export declare const includes: (item: unknown) => (result: unknown) => boolean
export declare const oneOf: (options: unknown[]) => (result: unknown) => boolean
export declare const matches: (pattern: RegExp) => (result: unknown) => boolean
export declare const has: {
  property: (key: string, check: Check) => (result: unknown) => boolean
  properties: (spec: Record<string, Check>) => (result: unknown) => boolean
  any: (spec: Record<string, Check>) => (result: unknown) => boolean
  nested: (path: string, predicate: Predicate) => (result: unknown) => boolean
  string: (substring: string) => (result: unknown) => boolean
  at: (index: number, check: Check) => (result: unknown) => boolean
  key: (keyName: string) => (result: unknown) => boolean
  keys: (keyNames: string[]) => (result: unknown) => boolean
  includes: (item: unknown) => (result: unknown) => boolean
  oneOf: (options: unknown[]) => (result: unknown) => boolean
  matches: (pattern: RegExp) => (result: unknown) => boolean
}
export {}
