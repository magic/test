// Shim for $app/forms
// Provides form enhancement functions
export const applyAction = async _result => {
  // In test environment, we can't update page state like a real browser
  // This is a no-op implementation
}
export function deserialize(result) {
  try {
    return JSON.parse(result)
  } catch {
    return {
      type: 'error',
      error: new Error('Failed to deserialize result'),
    }
  }
}
export function enhance(_formElement, _submit) {
  // No-op enhancement - form submits normally
  // Return destroy function for cleanup
  return {
    destroy() {
      // cleanup
    },
  }
}
