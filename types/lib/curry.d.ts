export function curry<TArgs, TReturn>(
  ...a: (Function | unknown)[]
): TReturn | CurryFunction<TArgs, TReturn>
export type CurryFunction<TArgs, TReturn> = (
  arg: unknown,
) => TReturn | CurryFunction<TArgs, TReturn>
//# sourceMappingURL=curry.d.ts.map
