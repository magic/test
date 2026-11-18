import is from '@magic/types'
/**
 * Execute a single test function with proper isolation
 */
export const executeTest = async (fn, _key, componentFile, componentProps, componentContext) => {
  if (componentFile) {
    const { mount } = await import('../../lib/svelte/mount.js')
    const { runWithContext } = await import('../../lib/svelte/shims/$app/state.js')
    const {
      target,
      component: instance,
      unmount,
      css,
      ctx,
    } = await mount(componentFile, { props: componentProps, context: componentContext })
    // Run the test function inside the mounted component's $app context so
    // interactions (clicks, form submits) that re-read $app/state see the
    // url/data/routeId the test set via props — not the default context.
    const runInContext = fn2 => runWithContext(ctx, fn2)
    try {
      if (is.function(fn)) {
        return await runInContext(async () => fn({ target, component: instance, unmount, css }))
      }
    } finally {
      await unmount()
      target.remove()
    }
  }
  if (is.function(fn)) {
    return await fn()
  } else if (is.promise(fn)) {
    return await fn
  }
  return fn
}
//# sourceMappingURL=executeTest.js.map
