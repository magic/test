import is from '@magic/types'

type QueryableElement =
  | Element
  | {
      querySelector: (selector: string) => Element | null
    }

const getElement = (target: QueryableElement, selector?: string): Element | null => {
  if (selector) {
    return target.querySelector(selector)
  }
  return target as Element
}

export const click = (target: QueryableElement, selector?: string): void => {
  const el = getElement(target, selector)
  if (el && is.instance(el, HTMLElement) && 'click' in el && is.fn(el.click)) {
    el.click()
  }
}

export const dblClick = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
  }
}

export const contextMenu = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
  }
}

export const trigger = (
  target: Element | Document,
  eventType: string,
  options: EventInit = {},
): void => {
  const event = new Event(eventType, { bubbles: true, ...options })
  target.dispatchEvent(event)
}

export const mouseDown = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  }
}

export const mouseUp = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
  }
}

export const mouseMove = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true }))
  }
}

export const mouseEnter = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: true }))
  }
}

export const mouseLeave = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false, cancelable: true }))
  }
}

export const mouseOver = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }))
  }
}

export const mouseOut = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  }
}

export const keyDown = (target: Element | Document, options?: string | KeyboardEventInit): void => {
  const opts = is.string(options) ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts }))
}

export const keyPress = (
  target: Element | Document,
  options?: string | KeyboardEventInit,
): void => {
  const opts = is.string(options) ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, ...opts }))
}

export const keyUp = (target: Element | Document, options?: string | KeyboardEventInit): void => {
  const opts = is.string(options) ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, ...opts }))
}

export const type = async (target: Element | Document, text: string, delay = 0): Promise<void> => {
  for (const char of text) {
    keyDown(target, { key: char })
    keyUp(target, { key: char })
    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

export const input = (
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element,
  value: string,
): void => {
  Object.defineProperty(target, 'value', { value, writable: false, configurable: true })
  target.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
}

export const change = (
  target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element,
  value: string,
): void => {
  Object.defineProperty(target, 'value', { value, writable: false, configurable: true })
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
}

export const blur = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    const event =
      typeof FocusEvent !== 'undefined'
        ? new FocusEvent('blur', { bubbles: false, cancelable: false })
        : new Event('blur', { bubbles: false, cancelable: false })
    el.dispatchEvent(event)
  }
}

export const focus = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    const event =
      typeof FocusEvent !== 'undefined'
        ? new FocusEvent('focus', { bubbles: false, cancelable: false })
        : new Event('focus', { bubbles: false, cancelable: false })
    el.dispatchEvent(event)
  }
}

export const focusIn = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    const event =
      typeof FocusEvent !== 'undefined'
        ? new FocusEvent('focusin', { bubbles: true, cancelable: false })
        : new Event('focusin', { bubbles: true, cancelable: false })
    el.dispatchEvent(event)
  }
}

export const focusOut = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    const event =
      typeof FocusEvent !== 'undefined'
        ? new FocusEvent('focusout', { bubbles: true, cancelable: false })
        : new Event('focusout', { bubbles: true, cancelable: false })
    el.dispatchEvent(event)
  }
}

export const submit = (target: HTMLFormElement | Element): void => {
  target.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

export const pointerDown = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
  }
}

export const pointerUp = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }))
  }
}

export const pointerMove = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true }))
  }
}

export const pointerOver = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, cancelable: true }))
  }
}

export const pointerOut = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, cancelable: true }))
  }
}

export const touchStart = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }))
  }
}

export const touchEnd = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }))
  }
}

export const touchMove = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true }))
  }
}

export const copy = (target: Element | Document): void => {
  target.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true }))
}

export const cut = (target: Element | Document): void => {
  target.dispatchEvent(new ClipboardEvent('cut', { bubbles: true, cancelable: true }))
}

export const paste = (target: Element | Document): void => {
  target.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true }))
}

export const dragStart = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }))
  }
}

export const drag = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('drag', { bubbles: true, cancelable: true }))
  }
}

export const dragEnd = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: false }))
  }
}

export const dragOver = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }))
  }
}

export const dragEnter = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true }))
  }
}

export const dragLeave = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true }))
  }
}

export const drop = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true }))
  }
}

export const resize = (target: Element | Window): void => {
  target.dispatchEvent(new Event('resize', { bubbles: false, cancelable: false }))
}

export const scroll = (
  target: Element & {
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

export const animationStart = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationstart', { bubbles: true, cancelable: false }))
  }
}

export const animationEnd = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationend', { bubbles: true, cancelable: false }))
  }
}

export const animationIteration = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationiteration', { bubbles: true, cancelable: false }))
  }
}

export const transitionEnd = (target: Element | Document, selector?: string): void => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true, cancelable: true }))
  }
}

export const play = (target: HTMLMediaElement | Element): void => {
  target.dispatchEvent(new Event('play', { bubbles: true, cancelable: false }))
}

export const pause = (target: HTMLMediaElement | Element): void => {
  target.dispatchEvent(new Event('pause', { bubbles: true, cancelable: false }))
}

export const ended = (target: HTMLMediaElement | Element): void => {
  target.dispatchEvent(new Event('ended', { bubbles: true, cancelable: false }))
}

export const volumeChange = (target: HTMLMediaElement | Element): void => {
  target.dispatchEvent(new Event('volumechange', { bubbles: true, cancelable: false }))
}

export const checked = (target: HTMLInputElement | HTMLSelectElement | Element): void => {
  Object.defineProperty(target, 'checked', { value: true, writable: false, configurable: true })
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }))
}

type FireEventOptions = {
  selector?: string
  detail?: unknown
}

export const fireEvent = (
  target: Element | Document,
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
