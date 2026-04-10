<script lang="ts">
  import { applyAction, enhance } from '$app/forms'

  let enhanceResult = $state<any>(null)

  $effect(() => {
    const form = document.createElement('form')
    enhanceResult = enhance(form)
  })

  const applyActionPromise = applyAction({ type: 'success', data: {} })
</script>

<div class="forms3">
  <span class="enhance-destroy">{enhanceResult?.destroy ? 'has-destroy' : 'no-destroy'}</span>
  <span class="applyaction-promise"
    >{applyActionPromise instanceof Promise ? 'is-promise' : 'not-promise'}</span
  >
</div>
