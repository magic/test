export const defaultItem = {
  lines: {
    found: 0,
    hit: 0,
    details: []
  },
  functions: {
    hit: 0,
    found: 0,
    details: []
  },
  branches: {
    hit: 0,
    found: 0,
    details: []
  }
}

export const lcovParse = (str = '') => {
  const data = []
  let item = { ...defaultItem }

  const lines = str.split('\n')

  lines.forEach((line, lineIndex) => {
    line = line.trim()

    const [name, ...allparts] = line.split(':')
    const value = allparts.join(':')

    const key = name.toUpperCase()

    if (key === 'TN') {
      item.title = value.trim();
    } else if (key === 'SF') {
      item.file = value.trim();
    } else if (key === 'FNF') {
      item.functions.found = Number(value.trim());
    } else if (key === 'FNH') {
      item.functions.hit = Number(value.trim());
    } else if (key === 'LF') {
      item.lines.found = Number(value.trim());
    } else if (key === 'LH') {
      item.lines.hit = Number(value.trim());
    } else if (key === 'DA') {
      const [line, hit] = value.split(',')

      item.lines.details.push({
        line: Number(line),
        hit: Number(hit)
      })
    } else if (key === 'FN') {
      const [name, line] = value.split(',')

      item.functions.details.push({
        name,
        line: Number(line)
      })
    } else if (key === 'FNDA') {
      const fn = value.split(',');
      item.functions.details.some((i, k) => {
        if (i.name === fn[1] && i.hit === undefined) {
          item.functions.details[k].hit = Number(fn[0])
          return true
        }
      })
    } else if (key === 'BRDA') {
      const [line, block, branch, taken] = value.split(',')
      item.branches.details.push({
        line: Number(line),
        block: Number(block),
        branch: Number(branch),
        taken: ((taken === '-') ? 0 : Number(taken)),
      })
    } else if (key === 'BRF') {
      item.branches.found = Number(value);
    } else if (key === 'BRH') {
      item.branches.hit = Number(value);
    }

    // last line
    if (lineIndex === lines.length - 1) {
      data.push(item)

      item = { ...defaultItem }
    }
  })

  return data
}