export function click(target: QueryableElement, selector?: string): void
export function dblClick(target: HTMLElement | Document, selector?: string): void
export function contextMenu(target: HTMLElement | Document, selector?: string): void
export function trigger(target: Element | Document, eventType: string, options?: EventInit): void
export function mouseDown(target: Element | Document, selector?: string): void
export function mouseUp(target: Element | Document, selector?: string): void
export function mouseMove(target: Element | Document, selector?: string): void
export function mouseEnter(target: Element | Document, selector?: string): void
export function mouseLeave(target: Element | Document, selector?: string): void
export function mouseOver(target: Element | Document, selector?: string): void
export function mouseOut(target: Element | Document, selector?: string): void
export function keyDown(target: Element | Document, options?: string | KeyboardEventInit): void
export function keyPress(target: Element | Document, options?: string | KeyboardEventInit): void
export function keyUp(target: Element | Document, options?: string | KeyboardEventInit): void
export function type(target: Element | Document, text: string, delay?: number): Promise<void>
export function input(
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element,
  value: string,
): void
export function change(
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element,
  value: string,
): void
export function blur(target: Element | Document, selector?: string): void
export function focus(target: Element | Document, selector?: string): void
export function focusIn(target: Element | Document, selector?: string): void
export function focusOut(target: Element | Document, selector?: string): void
export function submit(target: HTMLFormElement | Element): void
export function pointerDown(target: Element | Document, selector?: string): void
export function pointerUp(target: Element | Document, selector?: string): void
export function pointerMove(target: Element | Document, selector?: string): void
export function pointerOver(target: Element | Document, selector?: string): void
export function pointerOut(target: Element | Document, selector?: string): void
export function touchStart(target: Element | Document, selector?: string): void
export function touchEnd(target: Element | Document, selector?: string): void
export function touchMove(target: Element | Document, selector?: string): void
export function copy(target: Element | Document): void
export function cut(target: Element | Document): void
export function paste(target: Element | Document): void
export function dragStart(target: Element | Document, selector?: string): void
export function drag(target: Element | Document, selector?: string): void
export function dragEnd(target: Element | Document, selector?: string): void
export function dragOver(target: Element | Document, selector?: string): void
export function dragEnter(target: Element | Document, selector?: string): void
export function dragLeave(target: Element | Document, selector?: string): void
export function drop(target: Element | Document, selector?: string): void
export function resize(target: Element | Window): void
export function scroll(
  target: Element & {
    scrollTo?: (options?: ScrollToOptions) => void
    scrollTop?: number
    scrollLeft?: number
  },
  x?: number,
  y?: number,
): void
export function animationStart(target: Element | Document, selector?: string): void
export function animationEnd(target: Element | Document, selector?: string): void
export function animationIteration(target: Element | Document, selector?: string): void
export function transitionEnd(target: Element | Document, selector?: string): void
export function play(target: HTMLMediaElement | Element): void
export function pause(target: HTMLMediaElement | Element): void
export function ended(target: HTMLMediaElement | Element): void
export function volumeChange(target: HTMLMediaElement | Element): void
export function checked(target: HTMLInputElement | HTMLSelectElement | Element): void
export function fireEvent(
  target: Element | Document,
  eventName: string,
  options?: EventInit & FireEventOptions,
): void
export namespace fireEvent {
  export { click }
  export { dblClick }
  export { contextMenu }
  export { mouseDown }
  export { mouseUp }
  export { mouseMove }
  export { mouseEnter }
  export { mouseLeave }
  export { mouseOver }
  export { mouseOut }
  export { keyDown }
  export { keyPress }
  export { keyUp }
  export { type }
  export { input }
  export { change }
  export { blur }
  export { focus }
  export { focusIn }
  export { focusOut }
  export { submit }
  export { pointerDown }
  export { pointerUp }
  export { pointerMove }
  export { pointerOver }
  export { pointerOut }
  export { touchStart }
  export { touchEnd }
  export { touchMove }
  export { copy }
  export { cut }
  export { paste }
  export { dragStart }
  export { drag }
  export { dragEnd }
  export { dragOver }
  export { dragEnter }
  export { dragLeave }
  export { drop }
  export { resize }
  export { scroll }
  export { animationStart }
  export { animationEnd }
  export { animationIteration }
  export { transitionEnd }
  export { play }
  export { pause }
  export { ended }
  export { volumeChange }
  export { checked }
  export { trigger }
}
export type QueryableElement =
  | Element
  | {
      querySelector: (selector: string) => Element | null
    }
export type FireEventOptions = {
  /**
   * - CSS selector to find element
   */
  selector?: string | undefined
  /**
   * - Custom event detail
   */
  detail?: any
}
//# sourceMappingURL=events.d.ts.map
