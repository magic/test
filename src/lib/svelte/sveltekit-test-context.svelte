<script>
  import { page } from '$app/state';
  
  export let url = 'http://localhost';
  export let data = {};
  export let params = {};
  export let routeId = '';

  // Set page store immediately
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  page.set({
    url: urlObj,
    routeId,
    params,
    data,
    status: 200,
    error: null,
    form: undefined
  });
</script>

<slot />
