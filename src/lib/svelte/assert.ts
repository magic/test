import * as HappyDOM from 'happy-dom'

export const html = (target: unknown): string => (target as HappyDOM.HTMLElement).innerHTML

export const text = (target: unknown): string => (target as HappyDOM.HTMLElement).textContent ?? ''

export const component = (instance: unknown): unknown => instance

export const props = (target: unknown): Record<string, string> => {
  const el = target as HappyDOM.HTMLElement
  const result: Record<string, string> = {}
  for (const attr of el.attributes || []) {
    result[attr.name] = attr.value ?? ''
  }
  return result
}
