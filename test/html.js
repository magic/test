export default [
  {
    fn: i(['testing', p('testing')]),
    expect: '<i>testing<p>testing</p></i>',
    info: 'html i is undefined',
  },
  {
    fn: i({ class: 'testing' }, 'testing'),
    expect: '<i class="testing">testing</i>',
    info: '@magic/test can now test html',
  },
  {
    fn: Link({ to: '/testing' }),
    expect: '<a href="/testing">/testing</a>',
    info: '@magic builtin modules also work',
  },
]
