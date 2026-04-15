export const html = target => target.innerHTML
export const text = target => target.textContent ?? ''
export const component = instance => instance
export const props = target => {
  const el = target
  const result = {}
  for (const attr of el.attributes || []) {
    result[attr.name] = attr.value ?? ''
  }
  return result
}
