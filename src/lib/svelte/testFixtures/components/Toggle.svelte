<script>
  let { label = 'Toggle', initial = false } = $props()
  let on = $state(initial)
  export { on }
</script>

<div class="toggle">
  <label>
    <input type="checkbox" checked={on} />
    <span class="label">{label}</span>
  </label>
  <div class="status">{on ? 'ON' : 'OFF'}</div>
</div>
