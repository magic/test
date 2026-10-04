<script>
  import { getRequestEvent, read } from '$app/server'

  const event = getRequestEvent()
  const assetResponse = read('/test-asset.txt')
</script>

<div class="server">
  <span class="event">{event === null ? 'null' : 'exists'}</span>
  <span class="read-status">{assetResponse.status}</span>
</div>
