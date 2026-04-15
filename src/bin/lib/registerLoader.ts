import mod from 'node:module'
import url from 'node:url'
import path from 'node:path'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loaderPath = path.join(__dirname, 'tsLoader.js')
mod.register(url.pathToFileURL(loaderPath))
