<script>
  let { initial = 0, step = 1 } = $props()
  let count = $state(initial)
  export { count }

  const increment = () => {
    count += step
  }

  const decrement = () => {
    count -= step
  }
</script>

<div class="counter">
  <span class="count">{count}</span>
  <button class="inc" onclick={increment}>+{step}</button>
  <button class="dec" onclick={decrement}>-{step}</button>
</div>
