<script>
  let { tabs = [] } = $props()
  let activeTab = $state(tabs[0]?.id || null)
  export { activeTab }
</script>

<div class="tabs">
  <div class="tab-list">
    {#each tabs as tab}
      <button class="tab" class:active={activeTab === tab.id} onclick={() => (activeTab = tab.id)}>
        {tab.label}
      </button>
    {/each}
  </div>
  <div class="tab-panel">
    {#each tabs as tab}
      {#if activeTab === tab.id}
        <div class="tab-content" data-tab={tab.id}>{tab.content}</div>
      {/if}
    {/each}
  </div>
</div>
