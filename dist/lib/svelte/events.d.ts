import {
  Element,
  Document,
  Window,
  HTMLInputElement,
  HTMLTextAreaElement,
  HTMLSelectElement,
  HTMLFormElement,
  HTMLMediaElement,
} from 'happy-dom'
export declare const click: (target: unknown, selector?: string) => void
export declare const dblClick: (target: Element | Document, selector?: string) => void
export declare const contextMenu: (target: Element | Document, selector?: string) => void
export declare const trigger: (target: unknown, eventType: string, options?: EventInit) => void
export declare const mouseDown: (target: Element | Document, selector?: string) => void
export declare const mouseUp: (target: Element | Document, selector?: string) => void
export declare const mouseMove: (target: Element | Document, selector?: string) => void
export declare const mouseEnter: (target: Element | Document, selector?: string) => void
export declare const mouseLeave: (target: Element | Document, selector?: string) => void
export declare const mouseOver: (target: Element | Document, selector?: string) => void
export declare const mouseOut: (target: Element | Document, selector?: string) => void
export declare const keyDown: (
  target: Element | Document,
  options?: string | KeyboardEventInit,
) => void
export declare const keyPress: (
  target: Element | Document,
  options?: string | KeyboardEventInit,
) => void
export declare const keyUp: (
  target: Element | Document,
  options?: string | KeyboardEventInit,
) => void
export declare const type: (
  target: Element | Document,
  text: string,
  delay?: number,
) => Promise<void>
export declare const input: (
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element,
  value: string,
) => void
export declare const change: (
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element,
  value: string,
) => void
export declare const blur: (target: Element | Document, selector?: string) => void
export declare const focus: (target: Element | Document, selector?: string) => void
export declare const focusIn: (target: Element | Document, selector?: string) => void
export declare const focusOut: (target: Element | Document, selector?: string) => void
export declare const submit: (target: HTMLFormElement | Element) => void
export declare const pointerDown: (target: Element | Document, selector?: string) => void
export declare const pointerUp: (target: Element | Document, selector?: string) => void
export declare const pointerMove: (target: Element | Document, selector?: string) => void
export declare const pointerOver: (target: Element | Document, selector?: string) => void
export declare const pointerOut: (target: Element | Document, selector?: string) => void
export declare const touchStart: (target: Element | Document, selector?: string) => void
export declare const touchEnd: (target: Element | Document, selector?: string) => void
export declare const touchMove: (target: Element | Document, selector?: string) => void
export declare const copy: (target: Element | Document) => void
export declare const cut: (target: Element | Document) => void
export declare const paste: (target: Element | Document) => void
export declare const dragStart: (target: Element | Document, selector?: string) => void
export declare const drag: (target: Element | Document, selector?: string) => void
export declare const dragEnd: (target: Element | Document, selector?: string) => void
export declare const dragOver: (target: Element | Document, selector?: string) => void
export declare const dragEnter: (target: Element | Document, selector?: string) => void
export declare const dragLeave: (target: Element | Document, selector?: string) => void
export declare const drop: (target: Element | Document, selector?: string) => void
export declare const resize: (target: Element | Window) => void
export declare const scroll: (target: unknown, x?: number, y?: number) => void
export declare const animationStart: (target: Element | Document, selector?: string) => void
export declare const animationEnd: (target: Element | Document, selector?: string) => void
export declare const animationIteration: (target: Element | Document, selector?: string) => void
export declare const transitionEnd: (target: Element | Document, selector?: string) => void
export declare const play: (target: HTMLMediaElement | Element) => void
export declare const pause: (target: HTMLMediaElement | Element) => void
export declare const ended: (target: HTMLMediaElement | Element) => void
export declare const volumeChange: (target: HTMLMediaElement | Element) => void
export declare const checked: (target: HTMLInputElement | HTMLSelectElement | Element) => void
type FireEventOptions = {
  selector?: string
  detail?: unknown
}
export declare const fireEvent: {
  (target: Element | Document, eventName: string, options?: EventInit & FireEventOptions): void
  click: (target: unknown, selector?: string) => void
  dblClick: (target: Element | Document, selector?: string) => void
  contextMenu: (target: Element | Document, selector?: string) => void
  mouseDown: (target: Element | Document, selector?: string) => void
  mouseUp: (target: Element | Document, selector?: string) => void
  mouseMove: (target: Element | Document, selector?: string) => void
  mouseEnter: (target: Element | Document, selector?: string) => void
  mouseLeave: (target: Element | Document, selector?: string) => void
  mouseOver: (target: Element | Document, selector?: string) => void
  mouseOut: (target: Element | Document, selector?: string) => void
  keyDown: (target: Element | Document, options?: string | KeyboardEventInit) => void
  keyPress: (target: Element | Document, options?: string | KeyboardEventInit) => void
  keyUp: (target: Element | Document, options?: string | KeyboardEventInit) => void
  type: (target: Element | Document, text: string, delay?: number) => Promise<void>
  input: (
    target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element,
    value: string,
  ) => void
  change: (
    target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element,
    value: string,
  ) => void
  blur: (target: Element | Document, selector?: string) => void
  focus: (target: Element | Document, selector?: string) => void
  focusIn: (target: Element | Document, selector?: string) => void
  focusOut: (target: Element | Document, selector?: string) => void
  submit: (target: HTMLFormElement | Element) => void
  pointerDown: (target: Element | Document, selector?: string) => void
  pointerUp: (target: Element | Document, selector?: string) => void
  pointerMove: (target: Element | Document, selector?: string) => void
  pointerOver: (target: Element | Document, selector?: string) => void
  pointerOut: (target: Element | Document, selector?: string) => void
  touchStart: (target: Element | Document, selector?: string) => void
  touchEnd: (target: Element | Document, selector?: string) => void
  touchMove: (target: Element | Document, selector?: string) => void
  copy: (target: Element | Document) => void
  cut: (target: Element | Document) => void
  paste: (target: Element | Document) => void
  dragStart: (target: Element | Document, selector?: string) => void
  drag: (target: Element | Document, selector?: string) => void
  dragEnd: (target: Element | Document, selector?: string) => void
  dragOver: (target: Element | Document, selector?: string) => void
  dragEnter: (target: Element | Document, selector?: string) => void
  dragLeave: (target: Element | Document, selector?: string) => void
  drop: (target: Element | Document, selector?: string) => void
  resize: (target: Element | Window) => void
  scroll: (target: unknown, x?: number, y?: number) => void
  animationStart: (target: Element | Document, selector?: string) => void
  animationEnd: (target: Element | Document, selector?: string) => void
  animationIteration: (target: Element | Document, selector?: string) => void
  transitionEnd: (target: Element | Document, selector?: string) => void
  play: (target: HTMLMediaElement | Element) => void
  pause: (target: HTMLMediaElement | Element) => void
  ended: (target: HTMLMediaElement | Element) => void
  volumeChange: (target: HTMLMediaElement | Element) => void
  checked: (target: HTMLInputElement | HTMLSelectElement | Element) => void
  trigger: (target: unknown, eventType: string, options?: EventInit) => void
}
export {}
