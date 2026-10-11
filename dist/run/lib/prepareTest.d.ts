import type { WrappedTest, ComponentProps } from '../../types.js'
export interface PrepareTestArgs {
  componentFile?: string
  componentProps?: ComponentProps
  componentContext?: Record<PropertyKey, unknown>
}
/**
 * Prepare test by setting defaults and extracting component props
 */
export declare const prepareTest: (test: WrappedTest) => PrepareTestArgs
