const html = true

export default [
  {
    fn: () => i(['testing', p('testing')]),
    expect: ['i', ['testing', ['p', 'testing']]],
    info: 'html i is defined',
    html,
  },
  {
    fn: () => i({ class: 'testing' }, 'testing'),
    expect: ['i', { class: 'testing' }, 'testing'],
    info: '@magic/test can now test html',
    html,
  },
]
