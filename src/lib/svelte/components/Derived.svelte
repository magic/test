<script>
  let { items = [] } = $props()

  let count = $state(items.length)
  let doubleCount = $derived(count * 2)
  let isEmpty = $derived(count === 0)
  let isLarge = $derived(count > 5)

  export { count, doubleCount, isEmpty, isLarge }

  const add = () => {
    count += 1
  }

  const remove = () => {
    if (count > 0) count -= 1
  }
</script>

<div class="derived">
  <span class="count">Count: {count}</span>
  <span class="double">Double: {doubleCount}</span>
  <span class="empty">{isEmpty ? 'empty' : 'has items'}</span>
  <span class="large">{isLarge ? 'large' : 'small'}</span>
  <button class="add" onclick={add}>Add</button>
  <button class="remove" onclick={remove}>Remove</button>
</div>
