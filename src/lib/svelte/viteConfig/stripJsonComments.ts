export const stripJsonComments = (content: string): string => {
  let result = ''
  let inString = false
  let stringChar = ''

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const nextChar = content[i + 1]

    if (!inString) {
      if (char === '"') {
        inString = true
        stringChar = '"'
        result += char
      } else if (char === "'") {
        inString = true
        stringChar = "'"
        result += char
      } else if (char === '/' && nextChar === '/') {
        while (i < content.length && content[i] !== '\n') {
          i++
        }
      } else if (char === '/' && nextChar === '*') {
        while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) {
          i++
        }
        i++
      } else {
        result += char
      }
    } else {
      result += char
      if (char === stringChar && content[i - 1] !== '\\') {
        inString = false
      }
    }
  }

  return result
}
