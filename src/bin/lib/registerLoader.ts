import mod from 'node:module'

try {
  const { href } = new URL('./loader.js', import.meta.url)
  const parentURL = new URL(import.meta.url)

  mod.register(href, { parentURL })
} catch (err) {
  const e = err as Error
  process.stderr.write(`[registerLoader] ERROR: ${e.message}\n`)
}
