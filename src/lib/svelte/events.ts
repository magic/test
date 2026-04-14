import is from '@magic/types'

import {
  HTMLElement,
  Document,
  Window,
  Event,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  PointerEvent,
  TouchEvent,
  ClipboardEvent,
  AnimationEvent,
  CustomEvent,
  HTMLInputElement,
  HTMLTextAreaElement,
  HTMLSelectElement,
  HTMLFormElement,
  HTMLMediaElement,
} from 'happy-dom'

class DragEvent extends Event {
  dataTransfer?: unknown
}

class TransitionEvent extends Event {
  propertyName?: string
  elapsedTime?: number
}

const getElement = (
  target: HTMLElement | Document,
  selector?: string,
): HTMLElement | Document | null => {
  if (selector) {
    return target.querySelector(selector) as HTMLElement | null
  }

  return target
}

export const click = (target: HTMLElement, selector?: string): void => {
  const el = getElement(target, selector)
  if (el && is.instance(el, HTMLElement) && 'click' in el && is.fn(el.click)) {
    el.click()
  }
}

export const dblClick = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
  }
}

export const contextMenu = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
  }
}

export const trigger = (
  target: HTMLElement | Document,
  eventType: string,
  options: EventInit = {},
): void => {
  const event = new Event(eventType, { bubbles: true, ...options })
  target.dispatchEvent(event)
}

export const mouseDown = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  }
}

export const mouseUp = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
  }
}

export const mouseMove = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true }))
  }
}

export const mouseEnter = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: true }))
  }
}

export const mouseLeave = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false, cancelable: true }))
  }
}

export const mouseOver = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }))
  }
}

export const mouseOut = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  }
}

export const keyDown = (
  target: HTMLElement | Document,
  options?: string | KeyboardEventInit,
): void => {
  const opts = is.string(options) ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts }))
}

export const keyPress = (
  target: HTMLElement | Document,
  options?: string | KeyboardEventInit,
): void => {
  const opts = is.string(options) ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, ...opts }))
}

export const keyUp = (
  target: HTMLElement | Document,
  options?: string | KeyboardEventInit,
): void => {
  const opts = is.string(options) ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, ...opts }))
}

export const type = async (
  target: HTMLElement | Document,
  text: string,
  delay = 0,
): Promise<void> => {
  for (const char of text) {
    keyDown(target, { key: char })
    keyUp(target, { key: char })
    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

export const input = (
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLElement,
  value: string,
): void => {
  Object.defineProperty(target, 'value', { value, writable: false, configurable: true })
  target.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
}

export const change = (
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLElement,
  value: string,
): void => {
  Object.defineProperty(target, 'value', { value, writable: false, configurable: true })
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
}

export const blur = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    const event =
      typeof FocusEvent !== 'undefined'
        ? new FocusEvent('blur', { bubbles: false, cancelable: false })
        : new Event('blur', { bubbles: false, cancelable: false })
    el.dispatchEvent(event)
  }
}

export const focus = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    const event =
      typeof FocusEvent !== 'undefined'
        ? new FocusEvent('focus', { bubbles: false, cancelable: false })
        : new Event('focus', { bubbles: false, cancelable: false })
    el.dispatchEvent(event)
  }
}

export const focusIn = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    const event =
      typeof FocusEvent !== 'undefined'
        ? new FocusEvent('focusin', { bubbles: true, cancelable: false })
        : new Event('focusin', { bubbles: true, cancelable: false })
    el.dispatchEvent(event)
  }
}

export const focusOut = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    const event =
      typeof FocusEvent !== 'undefined'
        ? new FocusEvent('focusout', { bubbles: true, cancelable: false })
        : new Event('focusout', { bubbles: true, cancelable: false })
    el.dispatchEvent(event)
  }
}

export const submit = (target: HTMLFormElement | HTMLElement): void => {
  target.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

export const pointerDown = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
  }
}

export const pointerUp = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }))
  }
}

export const pointerMove = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true }))
  }
}

export const pointerOver = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, cancelable: true }))
  }
}

export const pointerOut = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, cancelable: true }))
  }
}

export const touchStart = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }))
  }
}

export const touchEnd = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }))
  }
}

export const touchMove = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true }))
  }
}

export const copy = (target: HTMLElement | Document): void => {
  target.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true }))
}

export const cut = (target: HTMLElement | Document): void => {
  target.dispatchEvent(new ClipboardEvent('cut', { bubbles: true, cancelable: true }))
}

export const paste = (target: HTMLElement | Document): void => {
  target.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true }))
}

export const dragStart = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }))
  }
}

export const drag = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('drag', { bubbles: true, cancelable: true }))
  }
}

export const dragEnd = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: false }))
  }
}

export const dragOver = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }))
  }
}

export const dragEnter = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true }))
  }
}

export const dragLeave = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true }))
  }
}

export const drop = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true }))
  }
}

export const resize = (target: HTMLElement | Window): void => {
  target.dispatchEvent(new Event('resize', { bubbles: false, cancelable: false }))
}

export const scroll = (
  target: HTMLElement & {
    scrollTo?: (options?: ScrollToOptions) => void
    scrollTop?: number
    scrollLeft?: number
  },
  x = 0,
  y = 0,
): void => {
  if (is.fn(target.scrollTo)) {
    target.scrollTo(x, y)
  } else {
    target.scrollTop = y
    target.scrollLeft = x
  }
  target.dispatchEvent(new Event('scroll', { bubbles: true, cancelable: false }))
}

export const animationStart = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationstart', { bubbles: true, cancelable: false }))
  }
}

export const animationEnd = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationend', { bubbles: true, cancelable: false }))
  }
}

export const animationIteration = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationiteration', { bubbles: true, cancelable: false }))
  }
}

export const transitionEnd = (target: HTMLElement | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true, cancelable: true }))
  }
}

export const play = (target: HTMLMediaElement | HTMLElement): void => {
  target.dispatchEvent(new Event('play', { bubbles: true, cancelable: false }))
}

export const pause = (target: HTMLMediaElement | HTMLElement): void => {
  target.dispatchEvent(new Event('pause', { bubbles: true, cancelable: false }))
}

export const ended = (target: HTMLMediaElement | HTMLElement): void => {
  target.dispatchEvent(new Event('ended', { bubbles: true, cancelable: false }))
}

export const volumeChange = (target: HTMLMediaElement | HTMLElement): void => {
  target.dispatchEvent(new Event('volumechange', { bubbles: true, cancelable: false }))
}

export const checked = (target: HTMLInputElement | HTMLSelectElement | HTMLElement): void => {
  Object.defineProperty(target, 'checked', { value: true, writable: false, configurable: true })
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }))
}

type FireEventOptions = {
  selector?: string
  detail?: unknown
}

export const fireEvent = (
  target: HTMLElement | Document,
  eventName: string,
  options: EventInit & FireEventOptions = {},
): void => {
  const { selector, detail, ...eventInit } = options
  const el = getElement(target, selector)

  if (!el) {
    console.warn(`fireEvent: No element found for selector "${selector}"`)
    return
  }

  if (detail) {
    el.dispatchEvent(new CustomEvent(eventName, { bubbles: true, cancelable: true, detail }))
  } else {
    el.dispatchEvent(new Event(eventName, { bubbles: true, cancelable: true, ...eventInit }))
  }
}

fireEvent.click = click
fireEvent.dblClick = dblClick
fireEvent.contextMenu = contextMenu
fireEvent.mouseDown = mouseDown
fireEvent.mouseUp = mouseUp
fireEvent.mouseMove = mouseMove
fireEvent.mouseEnter = mouseEnter
fireEvent.mouseLeave = mouseLeave
fireEvent.mouseOver = mouseOver
fireEvent.mouseOut = mouseOut
fireEvent.keyDown = keyDown
fireEvent.keyPress = keyPress
fireEvent.keyUp = keyUp
fireEvent.type = type
fireEvent.input = input
fireEvent.change = change
fireEvent.blur = blur
fireEvent.focus = focus
fireEvent.focusIn = focusIn
fireEvent.focusOut = focusOut
fireEvent.submit = submit
fireEvent.pointerDown = pointerDown
fireEvent.pointerUp = pointerUp
fireEvent.pointerMove = pointerMove
fireEvent.pointerOver = pointerOver
fireEvent.pointerOut = pointerOut
fireEvent.touchStart = touchStart
fireEvent.touchEnd = touchEnd
fireEvent.touchMove = touchMove
fireEvent.copy = copy
fireEvent.cut = cut
fireEvent.paste = paste
fireEvent.dragStart = dragStart
fireEvent.drag = drag
fireEvent.dragEnd = dragEnd
fireEvent.dragOver = dragOver
fireEvent.dragEnter = dragEnter
fireEvent.dragLeave = dragLeave
fireEvent.drop = drop
fireEvent.resize = resize
fireEvent.scroll = scroll
fireEvent.animationStart = animationStart
fireEvent.animationEnd = animationEnd
fireEvent.animationIteration = animationIteration
fireEvent.transitionEnd = transitionEnd
fireEvent.play = play
fireEvent.pause = pause
fireEvent.ended = ended
fireEvent.volumeChange = volumeChange
fireEvent.checked = checked
fireEvent.trigger = trigger
