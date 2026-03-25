export function click(target: HTMLElement | Document, selector?: string): void
export function trigger(target: Element | Document, eventType: string, options?: EventInit): void
export function scroll(
  target: Element & {
    scrollTo?: Function
    scrollTop?: number
    scrollLeft?: number
  },
  x?: number,
  y?: number,
): void
//# sourceMappingURL=events.d.ts.map
