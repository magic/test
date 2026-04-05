<script>
  import { resolve, match, asset, base } from '$app/paths';
  
  const resolved = resolve('/blog/[slug]', { slug: 'hello' });
  
  /** @type {{id: string, params: Record<string, string>} | null} */
  let matched = $state(null);
  
  $effect(async () => {
    matched = await match('/blog/hello');
  });
  
  const assetUrl = asset('/logo.png');
</script>

<div class="paths">
  <span class="resolved">{resolved}</span>
  <span class="match-id">{matched?.id}</span>
  <span class="match-params">{JSON.stringify(matched?.params)}</span>
  <span class="asset">{assetUrl}</span>
  <span class="base">{base}</span>
</div>
