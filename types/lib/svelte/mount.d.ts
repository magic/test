export function createSnippet(renderFn: string): any
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
export type ComponentProps = Record<string, unknown>
//# sourceMappingURL=mount.d.ts.map
