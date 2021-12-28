import path from 'path'

import cli from '@magic/cli'

import { lcovParse } from '../../lib/lcovParse.mjs'

const cwd = process.cwd()

export const generateCoverage = async () => {
  const c8CliPath = path.join(cwd, 'node_modules', '.bin', 'c8')

  const cmd = `${c8CliPath} report --reporter=text-lcov`
  const coverage = await cli.exec(cmd)

  const parsed = lcovParse(coverage)

  const header = ['lines', 'functions', 'branches']

  // let longestName = 5

  const rows = parsed.map(parse => {
    const { file, title, lines, branches, functions } = parse
    console.log({ file, title })

    // lines.percent = (lines.found / lines.hit) * 100

    // const linesMissed = lines.found - lines.hit
    // const linesPercentageMissed = (linesMissed / lines.found) * 100
    // console.log(lines.percent, linesPercentageMissed)

    // const line = [
    //   `${lines.percent}%`,
    //   // `${functions.percent}%`,
    //   // `${branches.percent}%`,
    // ]

    // return line
  })

  const content = `
| ----- | ----- | --------- | -------- |
| ${header.join(' | ')} |
|
  `.trim()

  const coveragePercent = 100

  const logo = `
<svg xmlns="http://www.w3.org/2000/svg" width="104" height="20" aria-label="coverage: 100%">
<linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
</linearGradient>
<clipPath id="a">
    <rect width="104" height="20" rx="3" fill="#fff"/>
</clipPath>
<g clip-path="url(#a)">
    <path fill="#555" d="M0 0h61v20H0z"/>
    <path fill="#4c1" d="M61 0h43v20H61z"/>
    <path fill="url(#b)" d="M0 0h104v20H0z"/>
</g>
<g fill="#fff" text-anchor="middle" text-rendering="geometricPrecision" font-size="110">
    <text x="315" y="140" textLength="510" transform="scale(.1)">coverage</text>
    <text x="815" y="140" textLength="330" transform="scale(.1)">${coveragePercent}%</text>
</g>
</svg>
`.trim()
}