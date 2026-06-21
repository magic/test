import { parsePngDimensions } from '../../../src/lib/dom/image.js'
import type { TestCase } from '../../../src/types.js'

export default [
  // parsePngDimensions
  {
    fn: () => parsePngDimensions('data:image/png;base64,'),
    expect: { width: 1, height: 1 },
    info: 'empty base64 returns 1x1',
  },
  {
    fn: () => parsePngDimensions('not-a-data-url'),
    expect: { width: 1, height: 1 },
    info: 'non-data URL returns 1x1',
  },
  {
    fn: () => parsePngDimensions(''),
    expect: { width: 1, height: 1 },
    info: 'empty string returns 1x1',
  },
  {
    fn: () => parsePngDimensions('data:image/png;base64,AA=='),
    expect: { width: 1, height: 1 },
    info: 'too short base64 returns 1x1',
  },
  {
    fn: () =>
      parsePngDimensions(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      ),
    expect: { width: 1, height: 1 },
    info: 'valid 1x1 PNG returns 1x1',
  },
  {
    fn: () => {
      const result = parsePngDimensions(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAICAIAAADZnw1bAAAAHElEQVQ4y2P8z8DwAFFEJTBmAMrwHAxGgxGKBhQAABNhAAe7qKfIAAAAASUVORK5CYII=',
      )
      return result.width > 0 && result.height > 0
    },
    expect: true,
    info: 'valid PNG returns positive dimensions',
  },
  {
    fn: () => parsePngDimensions('data:image/jpeg;base64,/9j/4AAQ'),
    expect: { width: 1, height: 1 },
    info: 'non-PNG mime type returns 1x1',
  },
  {
    fn: () => parsePngDimensions('data:image/png;base64,AAAA'),
    expect: { width: 1, height: 1 },
    info: 'valid header but zero dimensions returns 1x1',
  },
  {
    fn: () => {
      const result = parsePngDimensions(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAPklEQVQ4T2NkYGD4z8BAAowMDAz/YzUzMjKiVAFqLxgYGP4zMDAw4BowMjKiVAGjDgIwYQAAGkYB/yY7xEAAAAAASUVORK5CYII=',
      )
      return result.width > 0 && result.height > 0
    },
    expect: true,
    info: 'another valid PNG returns positive dimensions',
  },
] satisfies TestCase[]
