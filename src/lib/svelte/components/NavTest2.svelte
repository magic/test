<script lang="ts">
  import {
    replaceState,
    invalidate,
    invalidateAll,
    preloadData,
    preloadCode,
  } from '$app/navigation'
  import { page } from '$app/state'

  let {
    triggerReplace = false,
    triggerInvalidate = false,
    triggerInvalidateAll = false,
    triggerPreload = false,
  } = $props()

  let replaceUrl = $state('')
  let invalidateCalled = $state(false)
  let invalidateAllCalled = $state(false)
  let preloadedData = $state<any>(null)
  let preloadedCode = $state(false)

  $effect(() => {
    if (triggerReplace) {
      replaceState('/replace?x=1', { replaced: true })
      replaceUrl = page.url.pathname
    }
  })

  $effect(() => {
    if (triggerInvalidate) {
      invalidate('/some-url')
      invalidateCalled = true
    }
  })

  $effect(() => {
    if (triggerInvalidateAll) {
      invalidateAll()
      invalidateAllCalled = true
    }
  })

  $effect(() => {
    if (triggerPreload) {
      Promise.all([preloadData('/preload-data'), preloadCode('/preload-code.js')]).then(
        ([data, code]) => {
          preloadedData = data
          preloadedCode = code === undefined
        },
      )
    }
  })
</script>

<div class="nav2">
  <span class="replace-url">{replaceUrl}</span>
  <span class="invalidate">{invalidateCalled ? 'called' : 'not-called'}</span>
  <span class="invalidate-all">{invalidateAllCalled ? 'called' : 'not-called'}</span>
  <span class="preload-data">{JSON.stringify(preloadedData)}</span>
  <span class="preload-code">{preloadedCode ? 'loaded' : 'not-loaded'}</span>
</div>
