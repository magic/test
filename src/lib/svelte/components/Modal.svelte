<script>
  let { open = false, title = 'Modal' } = $props()
</script>

{#if open}
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>{title}</h3>
      </div>
      <div class="modal-body">
        <slot>Default content</slot>
      </div>
    </div>
  </div>
{/if}
