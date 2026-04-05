export default () => {
  globalThis.beforeAllJS = true

  return () => {
    delete globalThis.beforeAllJS
  }
}
