const getShardForTest = (testPath, totalShards) => {
  let hash = 0
  for (let i = 0; i < testPath.length; i++) {
    const char = testPath.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  hash = Math.abs(hash)
  return hash % totalShards
}

const getShardConfig = () => {
  const rawShards = process.env.MAGIC_TEST_SHARDS
  const rawShardId = process.env.MAGIC_TEST_SHARD_ID

  const shards = Math.max(1, parseInt(rawShards || '1', 10)) || 1
  const shardId = Math.max(0, parseInt(rawShardId || '0', 10)) || 0

  return { shards, shardId }
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error('Assertion failed: ' + message)
  }
}

const runShardingTests = () => {
  assert(
    getShardForTest('/test/a.js', 3) === getShardForTest('/test/a.js', 3),
    'Deterministic: same path yields same shard',
  )

  assert(getShardForTest('/test/a.js', 1) === 0, '1 shard always returns 0')

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

  const distribution = {}
  for (const path of testPaths) {
    const shard = getShardForTest(path, 3)
    distribution[shard] = (distribution[shard] || 0) + 1
  }

  const values = Object.values(distribution)
  const max = Math.max(...values)
  const min = Math.min(...values)

  assert(max - min <= 2, `Distribution even: max=${max}, min=${min}`)

  assert(getShardForTest('/test/a.js', 10) < 10, 'Shard ID always less than total shards')

  assert(getShardForTest('/test/a.js', 100) >= 0, 'Shard ID always non-negative')

  const path1 = '/test/verylongpath/with/nested/directories/and/a/long/filename.js'
  const path2 = '/test/verylongpath/with/nested/directories/and/a/long/filename.js'
  assert(getShardForTest(path1, 5) === getShardForTest(path2, 5), 'Long paths are deterministic')

  const uniqueShards = new Set(testPaths.map(p => getShardForTest(p, 3)))
  assert(uniqueShards.size > 1, 'Multiple unique shards used')

  const { shards, shardId } = getShardConfig()
  assert(shards >= 1, 'Shards is at least 1')
  assert(shardId >= 0, 'ShardId is non-negative')
  assert(shardId < shards, 'ShardId is less than shards')
}

export default [
  {
    fn: () => {
      runShardingTests()
      return true
    },
    expect: true,
    info: 'Sharding: deterministic, even distribution, edge cases',
  },
]
