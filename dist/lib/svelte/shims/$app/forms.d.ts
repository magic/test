interface ActionResult<Success, Failure> {
  type: 'success' | 'failure' | 'redirect' | 'error'
  success?: Success
  failure?: Failure
  location?: string
  status?: number
  data?: unknown
  error?: unknown
}
type ActionSuccess = Record<string, unknown> | undefined
type ActionFailure = Record<string, unknown> | undefined
interface EnhanceOptions<Success, Failure> {
  reset?: boolean
  invalidateAll?: boolean
  submit?: (args: {
    formData: FormData
    action: URL
    cancel: () => void
    result: (res: ActionResult<Success, Failure>) => void
    update: (opts?: EnhanceOptions<Success, Failure>) => Promise<void>
  }) => void | Promise<void>
}
export declare const applyAction: <Success extends ActionSuccess, Failure extends ActionFailure>(
  _result: ActionResult<Success, Failure>,
) => Promise<void>
export declare function deserialize<Success extends ActionSuccess, Failure extends ActionFailure>(
  result: string,
): ActionResult<Success, Failure>
export declare function enhance<Success extends ActionSuccess, Failure extends ActionFailure>(
  _formElement: HTMLFormElement,
  _submit?: (args: {
    formData: FormData
    action: URL
    cancel: () => void
    result: (res: ActionResult<Success, Failure>) => void
    update: (opts?: EnhanceOptions<Success, Failure>) => Promise<void>
  }) => void | Promise<void>,
): {
  destroy(): void
}
export {}
