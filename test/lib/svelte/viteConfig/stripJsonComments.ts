import { stripJsonComments } from '../../../../src/lib/svelte/viteConfig/stripJsonComments.js'

export default [
  {
    fn: () => stripJsonComments('{"a": 1}'),
    expect: '{"a": 1}',
    info: 'returns unchanged JSON without comments',
  },
  {
    fn: () => stripJsonComments('{"a": "hello // world"}'),
    expect: '{"a": "hello // world"}',
    info: 'preserves // inside double-quoted strings',
  },
  {
    fn: () => stripJsonComments("{'a': 'hello // world'}"),
    expect: "{'a': 'hello // world'}",
    info: 'preserves // inside single-quoted strings',
  },
  {
    fn: () => stripJsonComments("{'key': 'value'}"),
    expect: "{'key': 'value'}",
    info: 'handles single-quoted strings correctly',
  },
  {
    fn: () => stripJsonComments('{\n  "a": 1 // comment\n}'),
    expect: '{\n  "a": 1 \n}',
    info: 'strips single-line // comments',
  },
  {
    fn: () => stripJsonComments('{\n  "a": 1\n  // full line comment\n}'),
    expect: '{\n  "a": 1\n  \n}',
    info: 'strips full-line // comments',
  },
  {
    fn: () => stripJsonComments('{\n  "a": 1 /* comment */\n}'),
    expect: '{\n  "a": 1 \n}',
    info: 'strips single-line /* */ comments',
  },
  {
    fn: () => stripJsonComments('{\n  "a": 1\n  /* multi\n     line\n     comment */\n}'),
    expect: '{\n  "a": 1\n  \n}',
    info: 'strips multi-line /* */ comments',
  },
  {
    fn: () => stripJsonComments('{"a": "/* not a comment */"}'),
    expect: '{"a": "/* not a comment */"}',
    info: 'preserves /* */ inside double-quoted strings',
  },
  {
    fn: () => stripJsonComments("{'a': '/* not a comment */'}"),
    expect: "{'a': '/* not a comment */'}",
    info: 'preserves /* */ inside single-quoted strings',
  },
]
