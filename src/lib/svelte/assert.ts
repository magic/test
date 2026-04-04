export const html = (target: import('happy-dom').HTMLElement): string => target.innerHTML

export const text = (target: import('happy-dom').HTMLElement): string => target.textContent ?? ''

export const component = (
  instance: import('happy-dom').HTMLElement,
): import('happy-dom').HTMLElement => instance

export const props = (target: import('happy-dom').HTMLElement): Record<string, string> => {
  const result: Record<string, string> = {}
  for (const attr of target.attributes || []) {
    result[attr.name] = attr.value ?? ''
  }
  return result
}
