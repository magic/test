import is from '@magic/types'
import type { WrappedTest, ComponentProps, ContextOption } from '../../types.js'

export interface PrepareTestArgs {
  componentFile?: string
  componentProps?: ComponentProps
  componentContext?: ContextOption
}

/**
 * Prepare test by setting defaults and extracting component props
 */
export const prepareTest = (test: WrappedTest): PrepareTestArgs => {
  if (!is.ownProp(test, 'expect')) {
    if (is.ownProp(test, 'is')) {
      test.expect = test.is
    } else {
      test.expect = true
    }
  }

  const { component: componentProp, props: explicitProps, context: componentContext } = test

  if (!componentProp) {
    return {}
  }

  if (is.string(componentProp)) {
    return {
      componentFile: componentProp,
      componentProps: explicitProps || {},
      componentContext,
    }
  }

  if (is.array(componentProp)) {
    return {
      componentFile: componentProp[0],
      componentProps: componentProp[1] || {},
      componentContext,
    }
  }

  throw new Error('component must be a string or [string, props]')
}
