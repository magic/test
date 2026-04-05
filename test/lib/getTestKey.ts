import { getTestKey } from '../../src/lib/getTestKey.js'

export default [
  {
    fn: () => getTestKey('pkg', 'parent', 'name'),
    expect: 'pkg.parent#name',
    info: 'generates key with pkg, parent, and name',
  },
  {
    fn: () => getTestKey('pkg', 'parent', 'parent'),
    expect: 'pkg/parent',
    info: 'generates key when name equals parent',
  },
  {
    fn: () => getTestKey('pkg', 'pkg', 'name'),
    expect: 'pkg/name',
    info: 'generates key when parent equals pkg',
  },
  {
    fn: () => getTestKey('pkg', 'pkg', 'pkg'),
    expect: '/pkg',
    info: 'generates key when all params equal pkg',
  },
  {
    fn: () => getTestKey('', 'parent', 'name'),
    expect: '.parent#name',
    info: 'generates key with empty pkg',
  },
  {
    fn: () => getTestKey('pkg', '', 'name'),
    expect: '/name',
    info: 'generates key with empty parent',
  },
  {
    fn: () => getTestKey('pkg', 'parent', ''),
    expect: 'pkg.parent',
    info: 'generates key with empty name',
  },
  {
    fn: () => getTestKey(),
    expect: '',
    info: 'generates empty key with no params',
  },
  {
    fn: () => getTestKey('pkg', '/path', 'name'),
    expect: 'pkg/path#name',
    info: 'generates key with parent starting with /',
  },
  {
    fn: () => getTestKey('pkg', 'parent', '/name'),
    expect: 'pkg.parent/name',
    info: 'generates key with name starting with /',
  },
  {
    fn: () => getTestKey('pkg', 'parent', 'parent'),
    expect: 'pkg/parent',
    info: 'generates key without # when name equals parent',
  },
]
