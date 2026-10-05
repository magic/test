import is from '@magic/types'
import { getTestKey, cleanError } from '#src/lib/index.js'
/**
 * Create a failure result. Optionally attach a cleaned error.
 */
export const createFailResult = (testToRun, errorArg) => {
  const result = {
    result: undefined,
    msg: '',
    pass: false,
    parent: testToRun.parent || '',
    name: testToRun.name,
    expect: undefined,
    expString: undefined,
    key: testToRun.key || getTestKey(testToRun.pkg, testToRun.parent, testToRun.name),
    info: testToRun.info || '',
    pkg: testToRun.pkg,
  }
  if (errorArg !== undefined) {
    result.error = cleanError(is.error(errorArg) ? errorArg : new Error(String(errorArg)))
  }
  return result
}
//# sourceMappingURL=createFailResult.js.map
