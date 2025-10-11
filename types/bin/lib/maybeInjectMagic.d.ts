export function maybeInjectMagic(): Promise<void>
export type ModuleFn = (...args: unknown[]) =>
  | unknown[]
  | {
      View?: (...args: unknown[]) => unknown
    }
//# sourceMappingURL=maybeInjectMagic.d.ts.map
