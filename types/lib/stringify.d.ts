export function stringify(object: InputValue): JsonSafe
export type JsonSafe = string | number | boolean | null | undefined | object
export type JsonSafeArg = JsonSafe | (() => unknown)
/**
 * All acceptable input types to `stringify`, including functions and nested structures.
 */
export type InputValue = JsonSafeArg | JsonSafeArg[]
//# sourceMappingURL=stringify.d.ts.map
