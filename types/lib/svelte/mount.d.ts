export function createSnippet(renderFn: string | (() => string)): any
export function tick(): Promise<void>
export function mount(
  filePath: string,
  options?: {
    props?: ComponentProps
  },
): Promise<{
  target: HTMLDivElement
  component: any
  unmount: () => Promise<void>
  css: import('./compile.js').CssObject | null
}>
//# sourceMappingURL=mount.d.ts.map
