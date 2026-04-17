<script lang="ts">
  import { command, form, query, prerender, requested, query$batch } from '$app/server'

  const is = {
    function: (t: unknown): t is Function => typeof t === 'function',
  }

  const cmd = command(() => 'result')
  const frm = form(() => ({ foo: 'bar' }))
  const qry = query(() => ({ data: 1 }))
  const pre = prerender(() => ({ html: 'test' }))
  const req = requested(qry, 5)
  const batch = query$batch.batch(() => async args => args.map(a => a))

  const requestedIterable = !!req[Symbol.iterator]
  const batchResult = is.function(batch)
</script>

<div class="server2">
  <span class="command">{is.function(cmd) ? 'function' : 'other'}</span>
  <span class="form">{is.function(frm) ? 'function' : 'other'}</span>
  <span class="query">{is.function(qry) ? 'function' : 'other'}</span>
  <span class="prerender">{is.function(pre) ? 'function' : 'other'}</span>
  <span class="requested">{requestedIterable ? 'iterable' : 'not-iterable'}</span>
  <span class="batch">{batchResult ? 'function' : 'not-function'}</span>
</div>
