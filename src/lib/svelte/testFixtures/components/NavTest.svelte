<script>
  import { goto, pushState, beforeNavigate, afterNavigate, onNavigate } from '$app/navigation'
  import { page, navigating } from '$app/state'

  let { triggerGoto = false, triggerPush = false } = $props()

  let logs = $state([])
  // Captured synchronously right after pushState (same pattern as NavTest2):
  // the template reading the `page` proxy directly is context-dependent at
  // render time, and Svelte's flush queue is GLOBAL — a late flush from
  // another test (e.g. a pending navigation timer) can re-render this
  // component under a foreign AsyncLocalStorage context, making a
  // proxy-backed span show another test's URL. Local state is stable.
  let pushUrl = $state('')

  beforeNavigate(nav => {
    logs.push('before:' + nav.type)
  })

  afterNavigate(nav => {
    logs.push('after:' + nav.type)
  })

  onNavigate(nav => {
    logs.push('on:' + nav.type)
    return () => logs.push('on:cleanup')
  })

  $effect(() => {
    if (triggerGoto) {
      goto('/target?foo=bar')
      triggerGoto = false
    }
  })

  $effect(() => {
    if (triggerPush) {
      pushState('/push?x=1', { some: 'state' })
      pushUrl = page.url.pathname
      triggerPush = false
    }
  })
</script>

<div class="nav">
  <span class="url">{page.url.pathname}</span>
  <span class="push-url">{pushUrl}</span>
  <span class="navigating">{navigating ? 'busy' : 'idle'}</span>
  <span class="logs">{logs.join('|')}</span>
</div>
