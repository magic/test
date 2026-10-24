import { transformForNode } from '#src/lib/svelte/compile/transformForNode.js'

const code = (src: string) => src
const svelteAnonymous = code('export default function _unknown_($$anchor, $$props) { return null }')
const i18nKey = code('const msg = m.sk_auth_login_unknown_user()')

export default [
  {
    fn: () =>
      transformForNode(svelteAnonymous, 'src/Foo.svelte').includes('function Foo$component('),
    expect: true,
    info: 'Svelte anonymous `function _unknown_` is renamed to the component name',
  },
  {
    fn: () => transformForNode(svelteAnonymous, 'src/Foo.svelte').includes('_unknown_'),
    expect: false,
    info: 'no `_unknown_` left after the transform',
  },
  {
    fn: () =>
      transformForNode(i18nKey, 'src/Foo.svelte').includes('m.sk_auth_login_unknown_user()'),
    expect: true,
    info: 'i18n key `sk_auth_login_unknown_user` is NOT corrupted (substring, not the identifier)',
  },
  {
    fn: () =>
      transformForNode(code('const x = _unknown_a; const y = b_unknown_c'), 'src/Foo.svelte'),
    expect: 'const x = _unknown_a; const y = b_unknown_c',
    info: 'identifiers merely containing `_unknown_` are left untouched',
  },
  {
    fn: () => transformForNode(code('const _unknown_ = 1'), 'src/A-B.svelte'),
    // note: `$$` in the replacement string collapses to `$` (String.replace
    // semantics) — single-`$` naming is the long-standing behaviour
    expect: 'const A_B$component = 1',
    info: 'standalone `_unknown_` in other positions is renamed (component name sanitized)',
  },
]
