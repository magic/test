<script lang="ts">
  let { variant = 'primary', disabled = false, onclick } = $props()
  export { disabled }
</script>

<button class="btn {variant}" {disabled} {onclick}>
  <slot>Click me</slot>
</button>