<script lang="ts">
  import ListItem from './ListItem.svelte'

  let { items = [], title = 'List' } = $props()
  let itemsList = $state([...items])

  export { itemsList }

  const removeItem = index => {
    itemsList = itemsList.filter((_, i) => i !== index)
  }
</script>

<div class="list-container">
  <h2 class="list-title">{title}</h2>
  <ul class="list">
    {#each itemsList as item, index (item.id)}
      <ListItem {item} onRemove={() => removeItem(index)} />
    {/each}
  </ul>
  <div class="count">Total: {itemsList.length}</div>
</div>
