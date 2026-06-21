import { parentPort } from 'node:worker_threads'
// Worker receives compile requests and responds with results
// Each worker loads the Svelte compiler once, then reuses it
let compiler = null
const initCompiler = async () => {
  if (!compiler) {
    compiler = await import('svelte/compiler')
  }
  return compiler
}
const compileFile = async filePath => {
  const { compile } = await initCompiler()
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const source = await fs.readFile(filePath, 'utf-8')
  const result = compile(source, {
    filename: filePath,
    generate: 'client',
  })
  return {
    js: result.js.code,
    css: result.css,
  }
}
// Handle messages from main thread
parentPort?.on('message', async msg => {
  try {
    const result = await compileFile(msg.filePath)
    const response = { id: msg.id, result }
    parentPort?.postMessage(response)
  } catch (e) {
    const response = { id: msg.id, error: e.message }
    parentPort?.postMessage(response)
  }
})
// Signal ready
parentPort?.postMessage({ id: -1, result: { js: 'ready', css: null } })
