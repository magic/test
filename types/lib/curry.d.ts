export function curry<TArgs, TReturn>(
  ...a: (Function | any)[]
): TReturn | CurryFunction<TArgs, TReturn>
export type CurryFunction<TArgs, TReturn> = (arg: any) => TReturn | CurryFunction<TArgs, TReturn>
//# sourceMappingURL=curry.d.ts.map
