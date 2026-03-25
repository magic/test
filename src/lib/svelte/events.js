import is from '@magic/types'

/**
 * @param {HTMLElement | Document} target
 * @param {string} [selector]
 */
export const click = (target, selector) => {
  const el = selector ? target.querySelector(selector) : target
  if (el && is.instance(el, HTMLElement)) {
    /** @type {HTMLElement} */ ;(el).click()
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

/**
 * @param {Element & { scrollTo?: Function, scrollTop?: number, scrollLeft?: number }} target
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
  target.dispatchEvent(new Event('scroll', { bubbles: true }))
}
