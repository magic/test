import is from '@magic/types'
/**
 * Execute a single test function with proper isolation
 */
export const executeTest = async (fn, _key, componentFile, componentProps) => {
  if (componentFile) {
    const { mount } = await import('../../lib/svelte/mount.js')
    const {
      target,
      component: instance,
      unmount,
    } = await mount(componentFile, { props: componentProps })
    try {
      if (is.function(fn)) {
        return await fn({ target, component: instance, unmount })
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
