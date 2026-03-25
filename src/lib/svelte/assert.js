/**
 * @param {import('happy-dom').HTMLElement} target
 * @returns {string}
 */
export const html = target => target.innerHTML

/**
 * @param {import('happy-dom').HTMLElement} target
 * @returns {string}
 */
export const text = target => target.textContent ?? ''

/**
 * @param {import('happy-dom').HTMLElement} instance
 * @returns {import('happy-dom').HTMLElement}
 */
export const component = instance => instance

/**
 * @param {import('happy-dom').HTMLElement} target
 * @returns {Record<string, string>}
 */
export const props = target => {
  /** @type {Record<string, string>} */
  const result = {}
  for (const attr of target.attributes || []) {
    result[attr.name] = attr.value ?? ''
  }
  return result
}
