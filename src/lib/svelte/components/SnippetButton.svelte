<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    children,
    variant = 'primary',
    disabled = false,
    onclick,
  }: {
    children: Snippet
    variant?: string
    disabled?: boolean
    onclick?: () => void
  } = $props()
</script>

<button class="btn {variant}" {disabled} {onclick}>
  {@render children()}
</button>
