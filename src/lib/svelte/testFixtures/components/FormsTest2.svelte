<script lang="ts">
  import { deserialize } from '$app/forms'

  const validResult = deserialize('{"type":"success","data":{"foo":"bar"}}')
  const invalidResult = deserialize('not-json-string')
  const emptyString = deserialize('')
</script>

<div class="forms2">
  <span class="valid-type">{validResult.type}</span>
  <span class="valid-data">{JSON.stringify(validResult.data)}</span>
  <span class="invalid-type">{invalidResult.type}</span>
  <span class="invalid-error">{invalidResult.error ? 'has-error' : 'no-error'}</span>
  <span class="empty-type">{emptyString.type}</span>
</div>
