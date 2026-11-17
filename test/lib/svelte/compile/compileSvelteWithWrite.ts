import { spawn } from 'node:child_process'
import path from 'node:path'
import { mkdir, writeFile, rm, stat, access } from 'node:fs/promises'

import { compileSvelteWithWrite } from '#lib/svelte/compile/compileSvelteWithWrite.js'
import { getTempFilePath } from '#lib/svelte/compile/getTempFilePath.js'
import { CACHE_DIR } from '#src/constants.js'

// End-to-end behavior of the cache-aware compile entry point:
//   - miss compiles + records, hit serves the identical canonical js
//   - css sidecar keeps the public css field stable across hits
//   - a deleted dependency artifact (broken "island") is detected and healed
//   - MAGIC_TEST_COMPILE_CACHE=0 forces recompiles (downstream kill switch)
//
// Fixtures live under the cache dir (anchored, self-contained); every test
// uses its own subdirectory so parallel tests never collide.

const BASE = path.join(process.cwd(), CACHE_DIR, 'compileSvelteWithWrite')
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const compiledAbs = (sourceAbs: string) => path.join(process.cwd(), getTempFilePath(sourceAbs))
const fileExists = async (f: string) =>
  access(f).then(
    () => true,
    () => false,
  )

const mkPair = async (name: string, childContent: string, parentContent: string) => {
  const dir = path.join(BASE, name)
  const child = path.join(dir, 'Child.svelte')
  const parent = path.join(dir, 'Parent.svelte')
  await mkdir(dir, { recursive: true })
  await writeFile(child, childContent)
  await writeFile(parent, parentContent)
  return { child, parent }
}

export default {
  beforeAll: async () => {
    await mkdir(BASE, { recursive: true })
  },
  afterAll: async () => {
    await rm(BASE, { recursive: true, force: true }).catch(() => undefined)
  },
  tests: [
    {
      fn: async () => {
        const dir = path.join(BASE, 'hit')
        const file = path.join(dir, 'Plain.svelte')
        await mkdir(dir, { recursive: true })
        await writeFile(file, '<div>plain</div>')
        const r1 = await compileSvelteWithWrite(file)
        const m1 = await stat(compiledAbs(file))
        await sleep(25)
        const r2 = await compileSvelteWithWrite(file)
        const m2 = await stat(compiledAbs(file))
        return {
          identical: r1.js === r2.js,
          hasSourceMap: r1.js.includes('//# sourceMappingURL='),
          notRewritten: m1.mtimeMs === m2.mtimeMs,
          cssNull: r1.css === null,
        }
      },
      expect: (v: {
        identical: boolean
        hasSourceMap: boolean
        notRewritten: boolean
        cssNull: boolean
      }) => v.identical && v.hasSourceMap && v.notRewritten && v.cssNull,
      info: 'unchanged component: second compile is a hit (same js, no file rewrite, css null)',
    },
    {
      fn: async () => {
        const dir = path.join(BASE, 'styled')
        const file = path.join(dir, 'Styled.svelte')
        await mkdir(dir, { recursive: true })
        await writeFile(file, '<div class="box">x</div>\n<style>.box { color: red; }</style>\n')
        const r1 = await compileSvelteWithWrite(file)
        const m1 = await stat(compiledAbs(file))
        await sleep(25)
        const r2 = await compileSvelteWithWrite(file)
        const m2 = await stat(compiledAbs(file))
        return {
          styled: r1.css !== null,
          cssStable: JSON.stringify(r1.css) === JSON.stringify(r2.css),
          jsIdentical: r1.js === r2.js,
          notRewritten: m1.mtimeMs === m2.mtimeMs,
        }
      },
      expect: (v: {
        styled: boolean
        cssStable: boolean
        jsIdentical: boolean
        notRewritten: boolean
      }) => v.styled && v.cssStable && v.jsIdentical && v.notRewritten,
      info: 'styled component: css sidecar keeps css identical across a cache hit',
    },
    {
      fn: async () => {
        const { child, parent } = await mkPair(
          'stale-island',
          '<div>child</div>',
          '<script>import Child from "./Child.svelte"</script>\n<Child />\n',
        )
        const r1 = await compileSvelteWithWrite(parent)
        const childCompiled = compiledAbs(child)
        if (!(await fileExists(childCompiled))) {
          throw new Error('test setup: child compiled artifact missing after first compile')
        }
        // Break the island: the parent's compiled imports point at the child's
        // COMPILED file. Deleting it must be detected on the next hit.
        await rm(childCompiled).catch(() => undefined)
        const r2 = await compileSvelteWithWrite(parent)
        return {
          healed: await fileExists(childCompiled),
          jsIdentical: r1.js === r2.js,
        }
      },
      expect: (v: { healed: boolean; jsIdentical: boolean }) => v.healed && v.jsIdentical,
      info: 'deleted dependency artifact: stale island detected and recompiled (healed)',
    },
    {
      // The kill switch is a PROCESS-WIDE env var and tests run concurrently
      // in shared worker threads (which share process.env — even __isolate
      // only isolates the worker thread, not the env). Mutating it in-process
      // would disable the cache for sibling tests mid-run, so the assertion
      // runs in a child process where the env is private.
      fn: async () => {
        const cwd = process.cwd()
        const out = await new Promise<string>((resolve, reject) => {
          const child = spawn(
            process.execPath,
            [
              '--input-type=module',
              '-e',
              `
              const cwd = ${JSON.stringify(cwd)}
              process.chdir(cwd)
              const path = await import('node:path')
              const fs = await import('node:fs/promises')
              await import(${JSON.stringify(path.join(cwd, 'dist/bin/lib/registerLoader.js'))})
              const { compileSvelteWithWrite } = await import(${JSON.stringify(
                path.join(cwd, 'dist/lib/svelte/compile/compileSvelteWithWrite.js'),
              )})
              const { getTempFilePath } = await import(${JSON.stringify(
                path.join(cwd, 'dist/lib/svelte/compile/getTempFilePath.js'),
              )})
              const dir = path.join(cwd, 'node_modules/.magic-test-cache', 'killswitch-child-' + process.pid)
              const file = path.join(dir, 'Kill.svelte')
              await fs.mkdir(dir, { recursive: true })
              await fs.writeFile(file, '<div>kill</div>')
              const r1 = await compileSvelteWithWrite(file)
              const m1 = (await fs.stat(path.join(cwd, getTempFilePath(file)))).mtimeMs
              await new Promise(r => setTimeout(r, 30))
              const r2 = await compileSvelteWithWrite(file)
              const m2 = (await fs.stat(path.join(cwd, getTempFilePath(file)))).mtimeMs
              await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined)
              if (r1.js !== r2.js) { console.error('killswitch changed the output'); process.exit(1) }
              if (m1 === m2) { console.error('killswitch did not force a rewrite'); process.exit(1) }
              console.log('ok')
              `,
            ],
            { cwd, env: { ...process.env, MAGIC_TEST_COMPILE_CACHE: '0' } },
          )
          let o = ''
          child.stdout.on('data', d => (o += String(d)))
          child.stderr.on('data', d => (o += String(d)))
          child.on('error', reject)
          child.on('close', code =>
            code === 0 ? resolve(o) : reject(new Error('exit ' + code + ': ' + o)),
          )
        })
        return out.includes('ok')
      },
      expect: true,
      info: 'MAGIC_TEST_COMPILE_CACHE=0 (child process) forces a recompile with identical output',
    },
  ],
}
