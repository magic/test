import { version } from '../../../src/lib/version.js'

import { Button } from '../../../src/lib/svelte/testFixtures/index.js'

const spec = {
  Button: 'fn',
}

export default version({ Button }, spec)
