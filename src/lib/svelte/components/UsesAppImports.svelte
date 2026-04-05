<script>
  import { page } from '$app/state'
  import { browser } from '$app/environment'
</script>

<div class="wrapper-test">
  <span class="path">{$page.url.pathname}</span>
  <span class="browser">{browser}</span>
</div>
