<script lang="ts">
  let { value = '', placeholder = 'Type here...' } = $props()
  let inputValue = $state(value)
  let changed = $state(false)
  export { inputValue, changed }

  const handleInput = e => {
    inputValue = e.target.value
    changed = true
  }
</script>

<div class="input-wrapper">
  <input type="text" {placeholder} value={inputValue} oninput={handleInput} class="text-input" />
  <div class="meta">
    <span class="length">Length: {inputValue.length}</span>
    <span class="changed">{changed ? 'changed' : 'unchanged'}</span>
  </div>
</div>
