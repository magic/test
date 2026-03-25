<script>
  let count = $state(0)
  export { count }
</script>

<div class="count">{count}</div>
<button onclick={() => count++}>increment</button>
