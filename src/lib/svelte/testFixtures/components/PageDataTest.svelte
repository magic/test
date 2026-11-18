<script>
  import { page } from '$app/state'

  let open = $state(false)
</script>

<div class="pagedata">
  <span class="url">{page.url.pathname}</span>
  <span class="routeId">{page.routeId}</span>
  <span class="initial">{JSON.stringify(page.data.exhibition ?? null)}</span>
  <button class="toggle" onclick={() => (open = !open)}>toggle</button>
  {#if open}
    <span class="expanded">{JSON.stringify(page.data.exhibition?.data ?? null)}</span>
  {/if}
</div>
