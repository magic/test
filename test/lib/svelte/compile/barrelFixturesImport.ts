import type { Test } from '#src/types.js'
import is from '@magic/types'
import { has } from '#src/lib/has.js'

import * as IndexSvelteJs from '#lib/svelte/testFixtures/barrelFixtures/Index.svelte.js'
import * as DefaultBarrel from '#lib/svelte/testFixtures/barrelFixtures/DefaultBarrel.svelte.js'
import * as TypeExports from '#lib/svelte/testFixtures/barrelFixtures/TypeExports.svelte.js'

export default [
  {
    fn: () => IndexSvelteJs,
    expect: is.module,
    info: 'Index.svelte.js module loads correctly',
  },
  {
    fn: () => DefaultBarrel,
    expect: is.module,
    info: 'DefaultBarrel.svelte.js module loads correctly',
  },
  {
    fn: () => TypeExports,
    expect: is.module,
    info: 'TypeExports.svelte.js module loads correctly',
  },
  {
    fn: () => IndexSvelteJs,
    expect: has.key('TestComponent'),
    info: 'Index.svelte.js has expected TestComponent export',
  },
  {
    fn: async () => IndexSvelteJs,
    expect: has.key('TitleComponent'),
    info: 'Index.svelte.js has expected TitleComponent export',
  },
  {
    fn: () => {
      return 'default' in DefaultBarrel || 'NamedComponent' in DefaultBarrel
    },
    expect: true,
    info: 'DefaultBarrel.svelte.js has expected exports',
  },
  {
    fn: () => TypeExports,
    expect: has.key('TitleComponent'),
    info: 'TypeExports.svelte.js has expected TitleComponent export',
  },

  {
    fn: () => TypeExports,
    expect: has.key('Component'),
    info: 'TypeExports.svelte.js has expected Component export',
  },
  {
    component: '#lib/svelte/testFixtures/components/DefaultExport.svelte',
    fn: ({ target }) => target.innerHTML.length > 0,
    expect: true,
    info: 'DefaultExport.svelte renders to html',
  },
  {
    component: '#lib/svelte/testFixtures/components/TestComponent.svelte',
    fn: ({ target }) => target.innerHTML.length > 0,
    expect: true,
    info: 'TestComponent.svelte renders to html',
  },
  {
    component: '#lib/svelte/testFixtures/components/TitleComponent.svelte',
    fn: ({ target }) => target.innerHTML.length > 0,
    expect: true,
    info: 'TitleComponent.svelte renders to html',
  },
] satisfies Test[]
