export default () => {
  globalThis.beforeAllMJS = true

  return () => {
    delete globalThis.beforeAllMJS
  }
}
