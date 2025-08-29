<script lang="ts">
  import { getSelectedFamilyId, setSelectedFamilyId } from '$lib/stores.svelte.js';
  import type { Family } from '$lib/schema.js';

  interface Props {
    families: Family[];
  }

  let { families }: Props = $props();

  function handleFamilyChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    setSelectedFamilyId(target.value || null);
  }
</script>

<div class="flex items-center gap-2">
  <select
    id="family-filter"
    value={getSelectedFamilyId() || ''}
    onchange={handleFamilyChange}
    class="px-2 py-1 border rounded-md bg-background text-sm min-w-[100px] text-xs"
  >
    <option value="">All</option>
    {#each families as family}
      <option value={family.id}>
        {family.name}
      </option>
    {/each}
  </select>
  
  {#if getSelectedFamilyId()}
    {@const selectedFamily = families.find(f => f.id === getSelectedFamilyId())}
    {#if selectedFamily}
      <span 
        class="inline-block w-3 h-3 rounded-full flex-shrink-0"
        style="background-color: {selectedFamily.color}"
        title={selectedFamily.name}
      ></span>
    {/if}
  {/if}
</div>