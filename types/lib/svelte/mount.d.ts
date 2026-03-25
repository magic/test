export function mount(
  filePath: string,
  options?: {
    props?: object
  },
): Promise<{
  target: import('happy-dom').HTMLDivElement
  component: any
  unmount: () => Promise<void>
  css: any
}>
//# sourceMappingURL=mount.d.ts.map
