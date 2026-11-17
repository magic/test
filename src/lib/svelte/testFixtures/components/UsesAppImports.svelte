<script>
  import { browser } from '$app/environment'
  import { page } from '$app/state'
</script>

<div class="wrapper-test">
  <span class="path">{page.url.pathname}</span>
  <span class="browser">{browser}</span>
</div>
