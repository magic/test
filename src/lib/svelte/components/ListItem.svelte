<script>
  let { item, onRemove } = $props()
</script>

<li class="list-item">
  <span class="item-text">{item.text}</span>
  {#if onRemove}
    <button class="remove-btn" onclick={onRemove}>remove</button>
  {/if}
</li>
