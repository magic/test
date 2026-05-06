import type { WrappedTest, ComponentProps } from '../../types.ts'
/**
 * Prepare test by setting defaults and extracting component props
 */
export declare const prepareTest: (test: WrappedTest) => {
  componentFile?: string
  componentProps?: ComponentProps
}
