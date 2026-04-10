<script lang="ts">
  import { resolve, asset, base, assets } from '$app/paths'

  const resolvePathOnly = resolve('/simple/path')
  const resolveHttp = resolve('https://example.com/path')
  const assetPath = asset('/images/test.png')
  const baseValue = base
  const assetsValue = assets
</script>

<div class="paths2">
  <span class="resolve-path">{resolvePathOnly}</span>
  <span class="resolve-http">{resolveHttp}</span>
  <span class="asset">{assetPath}</span>
  <span class="base">{baseValue}</span>
  <span class="assets">{assetsValue}</span>
</div>
