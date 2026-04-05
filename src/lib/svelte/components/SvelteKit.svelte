<script>
  import { browser, dev, prod } from '$app/environment';
  
  let showEnv = $state(true);
</script>

{#if showEnv}
  <div class="env-info">
    <p>browser: {browser}</p>
    <p>dev: {dev}</p>
    <p>prod: {prod}</p>
  </div>
{/if}

<button onclick={() => showEnv = !showEnv}>Toggle</button>
