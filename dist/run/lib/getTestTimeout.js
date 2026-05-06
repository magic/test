import { DEFAULT_TEST_TIMEOUT } from '../../constants.js'
/**
 * Get timeout for a test, checking per-test option first, then env var
 */
export const getTestTimeout = testTimeout => {
  // Per-test override: { timeout: 30000 }
  if (testTimeout !== undefined) {
    return testTimeout > 0 ? testTimeout : DEFAULT_TEST_TIMEOUT
  }
  // Environment variable: MAGIC_TEST_TIMEOUT=30000
  const envTimeout = process.env.MAGIC_TEST_TIMEOUT
  if (envTimeout) {
    const parsed = parseInt(envTimeout, 10)
    return isNaN(parsed) ? DEFAULT_TEST_TIMEOUT : parsed
  }
  return DEFAULT_TEST_TIMEOUT
}
