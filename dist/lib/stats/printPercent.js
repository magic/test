import log from '@magic/log'
import { toMinimalFixed } from './toMinimalFixed.js'
/**
 * Returns a colored percentage string.
 */
export const printPercent = p => {
  let color = 'red'
  if (p === 100) {
    color = 'green'
  } else if (p > 90) {
    color = 'yellow'
  }
  const value = toMinimalFixed(p, 2)
  return log.color(color, value)
}
