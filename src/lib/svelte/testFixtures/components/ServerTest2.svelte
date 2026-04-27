<script lang="ts">
  import is from '@magic/types'
  import { command, form, query, prerender, requested, query$batch } from '$app/server'

  const cmd = command(() => 'result')
  const frm = form(() => ({ foo: 'bar' }))
  const qry = query(() => ({ data: 1 }))
  const pre = prerender(() => ({ html: 'test' }))
  const req = requested(qry, 5)
  const batch = query$batch.batch(() => async (args: unknown[]) => args.map(a => a))

  const requestedIterable = !!req[Symbol.iterator]
  const batchResult = is.fn(batch)
</script>

<div class="server2">
  <span class="command">{is.fn(cmd) ? 'function' : 'other'}</span>
  <span class="form">{is.fn(frm) ? 'function' : 'other'}</span>
  <span class="query">{is.fn(qry) ? 'function' : 'other'}</span>
  <span class="prerender">{is.fn(pre) ? 'function' : 'other'}</span>
  <span class="requested">{requestedIterable ? 'iterable' : 'not-iterable'}</span>
  <span class="batch">{batchResult ? 'function' : 'not-function'}</span>
</div>
