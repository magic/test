<script>
  import { page } from '$app/state'

  const { routeId } = $props()
</script>

<div>{$page.routeId || routeId}</div>
