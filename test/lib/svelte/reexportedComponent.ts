import { version } from '#lib/version.js'

import { Button } from '#lib/svelte/testFixtures/index.js'

const spec = {
  Button: 'fn',
}

export default version({ Button }, spec)
