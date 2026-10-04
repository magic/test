<script>
  import { applyAction, deserialize, enhance } from '$app/forms'

  const deserialized = deserialize('{"type":"success","data":{"message":"hello"}}')

  let enhanced = $state(false)

  function handleEnhance() {
    const result = enhance(document.createElement('form'))
    enhanced = true
  }
</script>

<div class="forms">
  <span class="deserialize-type">{deserialized.type}</span>
  <span class="deserialize-data">{JSON.stringify(deserialized.data)}</span>
  <span class="enhanced">{enhanced ? 'true' : 'false'}</span>
  <span class="applyaction-type">{typeof applyAction}</span>
</div>
