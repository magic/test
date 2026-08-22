import mod from 'node:module'
try {
  mod.register(new URL('./loader.js', import.meta.url).href)
} catch (e) {
  process.stderr.write(
    '[registerLoader] ERROR: ' + (e instanceof Error ? e.message : String(e)) + '\n',
  )
}
