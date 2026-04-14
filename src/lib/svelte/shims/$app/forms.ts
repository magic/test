// Shim for $app/forms
// Provides form enhancement functions

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

export const applyAction = async <Success extends ActionSuccess, Failure extends ActionFailure>(
  _result: ActionResult<Success, Failure>,
): Promise<void> => {
  // In test environment, we can't update page state like a real browser
  // This is a no-op implementation
}

export function deserialize<Success extends ActionSuccess, Failure extends ActionFailure>(
  result: string,
): ActionResult<Success, Failure> {
  try {
    return JSON.parse(result) as ActionResult<Success, Failure>
  } catch {
    return {
      type: 'error',
      error: new Error('Failed to deserialize result'),
    } as ActionResult<Success, Failure>
  }
}

export function enhance<Success extends ActionSuccess, Failure extends ActionFailure>(
  _formElement: HTMLFormElement,
  _submit?: (args: {
    formData: FormData
    action: URL
    cancel: () => void
    result: (res: ActionResult<Success, Failure>) => void
    update: (opts?: EnhanceOptions<Success, Failure>) => Promise<void>
  }) => void | Promise<void>,
): { destroy(): void } {
  // No-op enhancement - form submits normally
  // Return destroy function for cleanup
  return {
    destroy() {
      // cleanup
    },
  }
}
