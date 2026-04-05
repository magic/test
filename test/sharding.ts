const getShardForTest = (testPath: string, totalShards: number): number => {
  let hash = 2166136261
  for (let i = 0; i < testPath.length; i++) {
    hash ^= testPath.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % totalShards
}

export default [
  {
    fn: () => getShardForTest('/test/a.js', 3),
    expect: getShardForTest('/test/a.js', 3),
    info: 'Sharding is deterministic',
  },
  {
    fn: () => getShardForTest('/test/a.js', 1),
    expect: 0,
    info: '1 shard always returns 0',
  },
  {
    fn: () => {
      const testPaths = [
        '/test/file1.js',
        '/test/file2.js',
        '/test/file3.js',
        '/test/file4.js',
        '/test/file5.js',
        '/test/file6.js',
        '/test/file7.js',
        '/test/file8.js',
        '/test/file9.js',
        '/test/file10.js',
        '/test/file11.js',
        '/test/file12.js',
        '/test/file13.js',
        '/test/file14.js',
        '/test/file15.js',
      ]

      for (const path of testPaths) {
        const shard = getShardForTest(path, 3)
        if (shard < 0 || shard >= 3) {
          throw new Error(`Invalid shard ${shard} for ${path}`)
        }
      }
      return true
    },
    expect: true,
    info: 'All shards are in valid range 0-2',
  },
  {
    fn: () => getShardForTest('/test/a.js', 10) < 10,
    expect: true,
    info: 'Shard ID always less than total shards',
  },
  {
    fn: () => getShardForTest('/test/a.js', 100) >= 0,
    expect: true,
    info: 'Shard ID always non-negative',
  },
  {
    fn: () => {
      const path1 = '/test/verylongpath/with/nested/directories/and/a/long/filename.js'
      const path2 = '/test/verylongpath/with/nested/directories/and/a/long/filename.js'
      return getShardForTest(path1, 5) === getShardForTest(path2, 5)
    },
    expect: true,
    info: 'Long paths are deterministic',
  },
  {
    fn: () => {
      const testPaths = [
        '/test/file1.js',
        '/test/file2.js',
        '/test/file3.js',
        '/test/file4.js',
        '/test/file5.js',
        '/test/file6.js',
        '/test/file7.js',
        '/test/file8.js',
        '/test/file9.js',
        '/test/file10.js',
      ]
      const uniqueShards = new Set(testPaths.map(p => getShardForTest(p, 3)))
      return uniqueShards.size > 1
    },
    expect: true,
    info: 'Multiple unique shards used',
  },
]
