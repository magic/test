import is from '@magic/types'

/**
 * Get element by selector or return target
 * @param {any} target
 * @param {string} [selector]
 * @returns {any}
 */
const getElement = (target, selector) => {
  if (selector) {
    return target.querySelector(selector)
  }
  return target
}

/**
 * @param {any} target
 * @param {string} [selector]
 */
export const click = (target, selector) => {
  const el = getElement(target, selector)
  if (el && is.instance(el, HTMLElement) && 'click' in el && is.fn(el.click)) {
    el.click()
  }
}

/**
 * @param {HTMLElement | Document} target
 * @param {string} [selector]
 */
export const dblClick = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {HTMLElement | Document} target
 * @param {string} [selector]
 */
export const contextMenu = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} eventType
 * @param {EventInit} [options]
 */
export const trigger = (target, eventType, options = {}) => {
  const event = new Event(eventType, { bubbles: true, ...options })
  target.dispatchEvent(event)
}

// Mouse Events

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const mouseDown = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const mouseUp = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const mouseMove = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const mouseEnter = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const mouseLeave = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const mouseOver = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const mouseOut = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true }))
  }
}

// Keyboard Events

/**
 * @param {Element | Document} target
 * @param {string | KeyboardEventInit} [options]
 */
export const keyDown = (target, options) => {
  const opts = typeof options === 'string' ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...opts }))
}

/**
 * @param {Element | Document} target
 * @param {string | KeyboardEventInit} [options]
 */
export const keyPress = (target, options) => {
  const opts = typeof options === 'string' ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, ...opts }))
}

/**
 * @param {Element | Document} target
 * @param {string | KeyboardEventInit} [options]
 */
export const keyUp = (target, options) => {
  const opts = typeof options === 'string' ? { key: options } : options
  target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, ...opts }))
}

/**
 * Type text into an element (fires keydown + keyup for each character)
 * @param {Element | Document} target
 * @param {string} text
 * @param {number} [delay=0]
 */
export const type = async (target, text, delay = 0) => {
  for (const char of text) {
    keyDown(target, { key: char })
    keyUp(target, { key: char })
    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

// Input/Form Events

/**
 * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element} target
 * @param {string} value
 */
export const input = (target, value) => {
  Object.defineProperty(target, 'value', { value, writable: false, configurable: true })
  target.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
}

/**
 * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | Element} target
 * @param {string} value
 */
export const change = (target, value) => {
  Object.defineProperty(target, 'value', { value, writable: false, configurable: true })
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const blur = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    const event = typeof FocusEvent !== 'undefined' 
      ? new FocusEvent('blur', { bubbles: false, cancelable: false })
      : new Event('blur', { bubbles: false, cancelable: false })
    el.dispatchEvent(event)
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const focus = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    const event = typeof FocusEvent !== 'undefined'
      ? new FocusEvent('focus', { bubbles: false, cancelable: false })
      : new Event('focus', { bubbles: false, cancelable: false })
    el.dispatchEvent(event)
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const focusIn = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    const event = typeof FocusEvent !== 'undefined'
      ? new FocusEvent('focusin', { bubbles: true, cancelable: false })
      : new Event('focusin', { bubbles: true, cancelable: false })
    el.dispatchEvent(event)
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const focusOut = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    const event = typeof FocusEvent !== 'undefined'
      ? new FocusEvent('focusout', { bubbles: true, cancelable: false })
      : new Event('focusout', { bubbles: true, cancelable: false })
    el.dispatchEvent(event)
  }
}

/**
 * @param {HTMLFormElement | Element} target
 */
export const submit = target => {
  target.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

// Pointer Events

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const pointerDown = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const pointerUp = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const pointerMove = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const pointerOver = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const pointerOut = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, cancelable: true }))
  }
}

// Touch Events

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const touchStart = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const touchEnd = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const touchMove = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true }))
  }
}

// Clipboard Events

/**
 * @param {Element | Document} target
 */
export const copy = target => {
  target.dispatchEvent(new ClipboardEvent('copy', { bubbles: true, cancelable: true }))
}

/**
 * @param {Element | Document} target
 */
export const cut = target => {
  target.dispatchEvent(new ClipboardEvent('cut', { bubbles: true, cancelable: true }))
}

/**
 * @param {Element | Document} target
 */
export const paste = target => {
  target.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true }))
}

// Drag Events

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const dragStart = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const drag = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('drag', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const dragEnd = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: false }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const dragOver = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const dragEnter = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const dragLeave = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const drop = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true }))
  }
}

// Window/Document Events

/**
 * @param {Element | Window} target
 */
export const resize = target => {
  target.dispatchEvent(new Event('resize', { bubbles: false, cancelable: false }))
}

/**
 * @param {Element & { scrollTo?: (options?: ScrollToOptions) => void, scrollTop?: number, scrollLeft?: number }} target
 * @param {number} [x]
 * @param {number} [y]
 */
export const scroll = (target, x = 0, y = 0) => {
  if (is.fn(target.scrollTo)) {
    target.scrollTo(x, y)
  } else {
    target.scrollTop = y
    target.scrollLeft = x
  }
  target.dispatchEvent(new Event('scroll', { bubbles: true, cancelable: false }))
}

// Animation/Transition Events

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const animationStart = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationstart', { bubbles: true, cancelable: false }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const animationEnd = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationend', { bubbles: true, cancelable: false }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const animationIteration = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new AnimationEvent('animationiteration', { bubbles: true, cancelable: false }))
  }
}

/**
 * @param {Element | Document} target
 * @param {string} [selector]
 */
export const transitionEnd = (target, selector) => {
  const el = getElement(target, selector)
  if (el) {
    el.dispatchEvent(new TransitionEvent('transitionend', { bubbles: true, cancelable: true }))
  }
}

// Media Events

/**
 * @param {HTMLMediaElement | Element} target
 */
export const play = target => {
  target.dispatchEvent(new Event('play', { bubbles: true, cancelable: false }))
}

/**
 * @param {HTMLMediaElement | Element} target
 */
export const pause = target => {
  target.dispatchEvent(new Event('pause', { bubbles: true, cancelable: false }))
}

/**
 * @param {HTMLMediaElement | Element} target
 */
export const ended = target => {
  target.dispatchEvent(new Event('ended', { bubbles: true, cancelable: false }))
}

/**
 * @param {HTMLMediaElement | Element} target
 */
export const volumeChange = target => {
  target.dispatchEvent(new Event('volumechange', { bubbles: true, cancelable: false }))
}

/**
 * @param {HTMLInputElement | HTMLSelectElement | Element} target
 */
export const checked = target => {
  Object.defineProperty(target, 'checked', { value: true, writable: false, configurable: true })
  target.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }))
}

// fireEvent - unified API

/**
 * @typedef {Object} FireEventOptions
 * @property {string} [selector] - CSS selector to find element
 * @property {any} [detail] - Custom event detail
 */

/**
 * Unified fireEvent API
 * @param {Element | Document} target
 * @param {string} eventName
 * @param {EventInit & FireEventOptions} [options]
 */
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

// Attach all functions as methods to fireEvent
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
