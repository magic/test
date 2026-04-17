import is from '@magic/types'
import {
  Element,
  Event,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  PointerEvent,
  TouchEvent,
  ClipboardEvent,
  AnimationEvent,
  CustomEvent,
} from 'happy-dom'
class DragEvent extends Event {
  dataTransfer
}
class TransitionEvent extends Event {
  propertyName
  elapsedTime
}
const getElement = (target, selector) => {
  if (selector) {
    return target.querySelector(selector)
  }
  return target
}
export const click = (target, selector) => {
  const el = getElement(target, selector)
  if (el && is.instance(el, Element) && 'click' in el && is.fn(el.click)) {
    el.click()
  }
}
export const dblClick = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
  }
}
export const contextMenu = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
  }
}
export const trigger = (target, eventType, options = {}) => {
  if (!target) return
  const event = new Event(eventType, { bubbles: true, ...options })
  target.dispatchEvent(event)
}
export const mouseDown = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  }
}
export const mouseUp = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
  }
}
export const mouseMove = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true }))
  }
}
export const mouseEnter = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: true }))
  }
}
export const mouseLeave = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false, cancelable: true }))
  }
}
export const mouseOver = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }))
  }
}
export const mouseOut = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  }
}
export const keyDown = (target, options) => {
  const opts = is.string(options) ? { key: options } : options
  const { view: _view, ...rest } = opts || {}
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...rest }))
}
export const keyPress = (target, options) => {
  const opts = is.string(options) ? { key: options } : options
  const { view: _view, ...rest } = opts || {}
  target.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, ...rest }))
}
export const keyUp = (target, options) => {
  const opts = is.string(options) ? { key: options } : options
  const { view: _view, ...rest } = opts || {}
  target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, ...rest }))
}
export const type = async (target, text, delay = 0) => {
  for (const char of text) {
    keyDown(target, { key: char })
    keyUp(target, { key: char })
    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay))
    }
  }
}
export const input = (target, value) => {
  Object.defineProperty(target, 'value', { value, writable: false, configurable: true })
  target.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
}
export const change = (target, value) => {
  Object.defineProperty(target, 'value', { value, writable: false, configurable: true })
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
}
export const blur = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    const event = !is.undefined(FocusEvent)
      ? new FocusEvent('blur', { bubbles: false, cancelable: false })
      : new Event('blur', { bubbles: false, cancelable: false })
    el.dispatchEvent(event)
  }
}
export const focus = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    const event = !is.undefined(FocusEvent)
      ? new FocusEvent('focus', { bubbles: false, cancelable: false })
      : new Event('focus', { bubbles: false, cancelable: false })
    el.dispatchEvent(event)
  }
}
export const focusIn = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    const event = !is.undefined(FocusEvent)
      ? new FocusEvent('focusin', { bubbles: true, cancelable: false })
      : new Event('focusin', { bubbles: true, cancelable: false })
    el.dispatchEvent(event)
  }
}
export const focusOut = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    const event = !is.undefined(FocusEvent)
      ? new FocusEvent('focusout', { bubbles: true, cancelable: false })
      : new Event('focusout', { bubbles: true, cancelable: false })
    el.dispatchEvent(event)
  }
}
export const submit = target => {
  target.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}
export const pointerDown = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
  }
}
export const pointerUp = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }))
  }
}
export const pointerMove = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true }))
  }
}
export const pointerOver = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, cancelable: true }))
  }
}
export const pointerOut = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, cancelable: true }))
  }
}
export const touchStart = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }))
  }
}
export const touchEnd = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }))
  }
}
export const touchMove = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true }))
  }
}
export const copy = target => {
  target.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true }))
}
export const cut = target => {
  target.dispatchEvent(new ClipboardEvent('cut', { bubbles: true, cancelable: true }))
}
export const paste = target => {
  target.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true }))
}
export const dragStart = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }))
  }
}
export const drag = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('drag', { bubbles: true, cancelable: true }))
  }
}
export const dragEnd = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: false }))
  }
}
export const dragOver = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }))
  }
}
export const dragEnter = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true }))
  }
}
export const dragLeave = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true }))
  }
}
export const drop = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true }))
  }
}
export const resize = target => {
  target.dispatchEvent(new Event('resize', { bubbles: false, cancelable: false }))
}
export const scroll = (target, x = 0, y = 0) => {
  const el = target
  if (is.fn(el.scrollTo)) {
    el.scrollTo(x, y)
  } else {
    el.scrollTop = y
    el.scrollLeft = x
  }
  el.dispatchEvent(new Event('scroll', { bubbles: true, cancelable: false }))
}
export const animationStart = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationstart', { bubbles: true, cancelable: false }))
  }
}
export const animationEnd = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationend', { bubbles: true, cancelable: false }))
  }
}
export const animationIteration = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationiteration', { bubbles: true, cancelable: false }))
  }
}
export const transitionEnd = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true, cancelable: true }))
  }
}
export const play = target => {
  target.dispatchEvent(new Event('play', { bubbles: true, cancelable: false }))
}
export const pause = target => {
  target.dispatchEvent(new Event('pause', { bubbles: true, cancelable: false }))
}
export const ended = target => {
  target.dispatchEvent(new Event('ended', { bubbles: true, cancelable: false }))
}
export const volumeChange = target => {
  target.dispatchEvent(new Event('volumechange', { bubbles: true, cancelable: false }))
}
export const checked = target => {
  Object.defineProperty(target, 'checked', { value: true, writable: false, configurable: true })
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }))
}
export const fireEvent = (target, eventName, options = {}) => {
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
