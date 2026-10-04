<script>
  let { title = '', bordered = false } = $props()
</script>

<div class="card" class:bordered>
  {#if title}
    <div class="card-header">{title}</div>
  {/if}
  <div class="card-content">
    <slot>Default card content</slot>
  </div>
</div>
