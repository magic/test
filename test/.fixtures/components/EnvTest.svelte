<script>
  import { browser, dev, prod, building, version } from '$app/environment'
</script>

<div class="env">
  <span class="browser">{browser}</span>
  <span class="dev">{dev}</span>
  <span class="prod">{prod}</span>
  <span class="building">{building}</span>
  <span class="version">{version}</span>
</div>
