<script>
  import { goto, pushState, beforeNavigate, afterNavigate, onNavigate } from '$app/navigation';
  import { page, navigating } from '$app/state';
  
  let { triggerGoto = false, triggerPush = false } = $props();
  
  let logs = $state([]);
  
  beforeNavigate((nav) => {
    logs.push('before:' + nav.type);
  });
  
  afterNavigate((nav) => {
    logs.push('after:' + nav.type);
  });
  
   onNavigate((nav) => {
     logs.push('on:' + nav.type);
     return () => logs.push('on:cleanup');
   });

   $effect(() => {
     if (triggerGoto) {
       goto('/target?foo=bar');
       triggerGoto = false;
     }
   });

   $effect(() => {
     if (triggerPush) {
       pushState('/push?x=1', { some: 'state' });
       triggerPush = false;
     }
   });
 </script>

<div class="nav">
  <span class="url">{$page.url.pathname}</span>
  <span class="navigating">{($navigating ? 'busy' : 'idle')}</span>
  <span class="logs">{logs.join('|')}</span>
</div>
