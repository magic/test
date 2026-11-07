import type { WrappedTest, ComponentProps, ContextOption } from '../../types.js'
export interface PrepareTestArgs {
  componentFile?: string
  componentProps?: ComponentProps
  componentContext?: ContextOption
}
/**
 * Prepare test by setting defaults and extracting component props
 */
export declare const prepareTest: (test: WrappedTest) => PrepareTestArgs
