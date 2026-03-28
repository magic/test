import is from '@magic/types'

/**
 * @param {HTMLElement | Document} target
 * @param {string} [selector]
 */
export const click = (target, selector) => {
  const el = selector ? target.querySelector(selector) : target
  if (el && is.instance(el, HTMLElement) && 'click' in el && is.fn(el.click)) {
    el.click()
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
  target.dispatchEvent(new Event('scroll', { bubbles: true }))
}
