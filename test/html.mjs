export default [
  {
    fn: () => i(['testing', p('testing')]),
    expect: ['i', ['testing', ['p', 'testing']]],
    info: 'html i is defined',
    html: true,
  },
]
