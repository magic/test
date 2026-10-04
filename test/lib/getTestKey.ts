import is from '@magic/types'
import { getTestKey } from '#src/lib/getTestKey.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // No arguments
  {
    fn: () => getTestKey(),
    expect: '',
    info: 'getTestKey() returns empty string',
  },
  // Only pkg - no parent, no name → empty string
  {
    fn: () => getTestKey('pkg'),
    expect: '',
    info: 'getTestKey("pkg") returns empty string (no parent/name)',
  },
  // pkg and parent (parent != pkg)
  {
    fn: () => getTestKey('pkg', 'parent'),
    expect: 'pkg.parent',
    info: 'getTestKey("pkg", "parent") returns pkg.parent',
  },
  // pkg, parent, name (all different)
  {
    fn: () => getTestKey('pkg', 'parent', 'name'),
    expect: 'pkg.parent#name',
    info: 'getTestKey("pkg", "parent", "name") returns pkg.parent#name',
  },
  // parent starts with /
  {
    fn: () => getTestKey('pkg', '/abs/name'),
    expect: 'pkg/abs/name',
    info: 'getTestKey with parent starting with / uses / separator',
  },
  // pkg empty, parent and name provided
  {
    fn: () => getTestKey('', 'parent', 'name'),
    expect: '.parent#name',
    info: 'getTestKey with empty pkg adds leading dot to parent',
  },
  // parent === pkg
  {
    fn: () => getTestKey('pkg', 'pkg', 'name'),
    expect: 'pkg/name',
    info: 'getTestKey when parent===pkg returns pkg/name',
  },
  // name starts with /
  {
    fn: () => getTestKey('pkg', 'parent', '/name'),
    expect: 'pkg.parent/name',
    info: 'getTestKey with name starting with / uses / instead of #',
  },
  // parent === name (but not pkg)
  {
    fn: () => getTestKey('pkg', 'parent', 'parent'),
    expect: 'pkg/parent',
    info: 'getTestKey when parent===name returns pkg/parent',
  },
  // pkg and name, no parent (parent is undefined)
  {
    fn: () => getTestKey('pkg', undefined, 'name'),
    expect: '/name',
    info: 'getTestKey("pkg", undefined, "name") returns /name',
  },
  // Only name
  {
    fn: () => getTestKey(undefined, undefined, 'name'),
    expect: '/name',
    info: 'getTestKey(undefined, undefined, "name") returns /name',
  },
  // parent is undefined, pkg and name starting with /
  {
    fn: () => getTestKey('pkg', undefined, '/abs'),
    expect: '/abs',
    info: 'getTestKey with name starting with / and no parent uses /',
  },
  // Empty string name (falsy, so name block skipped)
  {
    fn: () => getTestKey('pkg', 'parent', ''),
    expect: 'pkg.parent',
    info: 'getTestKey with empty name returns pkg.parent (name block skipped)',
  },
  // Empty string parent (falsy, so parent blocks skipped)
  {
    fn: () => getTestKey('pkg', '', 'name'),
    expect: '/name',
    info: 'getTestKey with empty parent returns /name (parent blocks skipped)',
  },
  // Empty string pkg
  {
    fn: () => getTestKey('', 'parent', 'name'),
    expect: '.parent#name',
    info: 'getTestKey with empty pkg returns .parent#name',
  },
  // All empty strings (all falsy)
  {
    fn: () => getTestKey('', '', ''),
    expect: '',
    info: 'getTestKey with all empty strings returns empty',
  },
  // Null pkg (stringified to 'null')
  {
    fn: () => getTestKey(null as unknown as string, 'parent', 'name'),
    expect: 'null.parent#name',
    info: 'getTestKey with null pkg stringifies to "null"',
  },
  // Parent is /
  {
    fn: () => getTestKey('pkg', '/', 'name'),
    expect: 'pkg/#name',
    info: 'getTestKey with parent=/ keeps / and adds # for name',
  },
  // Name is /
  {
    fn: () => getTestKey('pkg', 'parent', '/'),
    expect: 'pkg.parent/',
    info: 'getTestKey with name=/ returns trailing /',
  },
  // pkg, parent, name where parent has no leading / but is not pkg
  {
    fn: () => getTestKey('pkg', 'foo', 'bar'),
    expect: 'pkg.foo#bar',
    info: 'getTestKey with regular parent and name uses # separator',
  },
  // Multiple parents (nested)
  {
    fn: () => getTestKey('pkg', 'parent.child', 'name'),
    expect: 'pkg.parent.child#name',
    info: 'getTestKey with dot in parent preserves it',
  },
]

export default tests
