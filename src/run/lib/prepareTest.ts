import is from '@magic/types'
import type { WrappedTest, ComponentProps } from '../../types.ts'

/**
 * Prepare test by setting defaults and extracting component props
 */
export const prepareTest = (
  test: WrappedTest,
): { componentFile?: string; componentProps?: ComponentProps } => {
  if (!is.ownProp(test, 'expect')) {
    if (is.ownProp(test, 'is')) {
      test.expect = test.is
    } else {
      test.expect = true
    }
  }

  const { component: componentProp, props: explicitProps } = test

  if (!componentProp) {
    return {}
  }

  if (is.string(componentProp)) {
    return {
      componentFile: componentProp,
      componentProps: explicitProps || {},
    }
  }

  if (is.array(componentProp)) {
    return {
      componentFile: componentProp[0],
      componentProps: componentProp[1] || {},
    }
  }

  throw new Error('component must be a string or [string, props]')
}
