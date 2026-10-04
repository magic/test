<script>
  import { page, navigating, updated } from '$app/stores'

  const pageUrl = $page?.url?.pathname || ''
  const navigatingVal = $navigating
  const updatedVal = $updated
</script>

<div class="stores">
  <span class="page-url">{pageUrl}</span>
  <span class="navigating">{navigatingVal ? 'nav' : 'idle'}</span>
  <span class="updated">{updatedVal ? 'true' : 'false'}</span>
</div>
