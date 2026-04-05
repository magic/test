export default () => {
  globalThis.afterAllMJS = true

  return () => {
    delete globalThis.afterAllMJS
  }
}
