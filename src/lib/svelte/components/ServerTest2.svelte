<script lang="ts">
  import { command, form, query, prerender, requested, query$batch } from '$app/server'

  const cmd = command(() => 'result')
  const frm = form(() => ({ foo: 'bar' }))
  const qry = query(() => ({ data: 1 }))
  const pre = prerender(() => ({ html: 'test' }))
  const req = requested(qry, 5)
  const batch = query$batch.batch(() => async args => args.map(a => a))

  const requestedIterable = !!req[Symbol.iterator]
  const batchResult = typeof batch === 'function'
</script>

<div class="server2">
  <span class="command">{typeof cmd === 'function' ? 'function' : 'other'}</span>
  <span class="form">{typeof frm === 'function' ? 'function' : 'other'}</span>
  <span class="query">{typeof qry === 'function' ? 'function' : 'other'}</span>
  <span class="prerender">{typeof pre === 'function' ? 'function' : 'other'}</span>
  <span class="requested">{requestedIterable ? 'iterable' : 'not-iterable'}</span>
  <span class="batch">{batchResult ? 'function' : 'not-function'}</span>
</div>
