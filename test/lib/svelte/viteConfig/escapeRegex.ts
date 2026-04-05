import { escapeRegex } from '../../src/lib/svelte/viteConfig/escapeRegex.js'

export default [
  {
    fn: () => escapeRegex('hello'),
    expect: 'hello',
    info: 'no special chars unchanged',
  },
  {
    fn: () => escapeRegex('hello.world'),
    expect: 'hello\\.world',
    info: 'escapes dot',
  },
  {
    fn: () => escapeRegex('hello*world'),
    expect: 'hello\\*world',
    info: 'escapes asterisk',
  },
  {
    fn: () => escapeRegex('hello+world'),
    expect: 'hello\\+world',
    info: 'escapes plus',
  },
  {
    fn: () => escapeRegex('hello?world'),
    expect: 'hello\\?world',
    info: 'escapes question mark',
  },
  {
    fn: () => escapeRegex('hello[world]'),
    expect: 'hello\\[world\\]',
    info: 'escapes brackets',
  },
  {
    fn: () => escapeRegex('hello(world)'),
    expect: 'hello\\(world\\)',
    info: 'escapes parentheses',
  },
  {
    fn: () => escapeRegex('hello^world'),
    expect: 'hello\\^world',
    info: 'escapes caret',
  },
  {
    fn: () => escapeRegex('hello$world'),
    expect: 'hello\\$world',
    info: 'escapes dollar',
  },
  {
    fn: () => escapeRegex('hello\\world'),
    expect: 'hello\\\\world',
    info: 'escapes backslash',
  },
  {
    fn: () => escapeRegex('hello|world'),
    expect: 'hello\\|world',
    info: 'escapes pipe',
  },
  {
    fn: () => escapeRegex('hello{world}'),
    expect: 'hello\\{world\\}',
    info: 'escapes braces',
  },
]
