<script>
  import { page, navigating, updated } from '$app/state';
  
  const paramsExist = $derived($page.params && Object.keys($page.params).length > 0);
  const routeIdExist = $derived($page.routeId !== '');
</script>

<div class="state">
  <span class="url">{$page.url.pathname}</span>
  <span class="routeId">{$page.routeId}</span>
  <span class="params">{JSON.stringify($page.params)}</span>
  <span class="data">{JSON.stringify($page.data)}</span>
  <span class="status">{$page.status}</span>
  <span class="error">{$page.error ? 'error' : 'ok'}</span>
  <span class="navigating">{($navigating ? 'nav' : 'still')}</span>
  <span class="updated-current">{updated.current}</span>
  <span class="params-exist">{paramsExist ? 'yes' : 'no'}</span>
  <span class="routeId-exist">{routeIdExist ? 'yes' : 'no'}</span>
</div>
