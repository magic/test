export function createSnippet(renderFn: string): any
export function tick(): Promise<void>
export function mount(
  filePath: string,
  options?: {
    props?: Record<string, unknown>
  },
): Promise<{
  target: HTMLDivElement
  component: any
  unmount: () => Promise<void>
  css: any
}>
//# sourceMappingURL=mount.d.ts.map
