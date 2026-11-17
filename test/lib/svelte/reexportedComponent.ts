import { Button } from '#lib/svelte/testFixtures/index.js'
import { version } from '#lib/version.js'

const spec = {
  Button: 'fn',
}

export default version({ Button }, spec)
