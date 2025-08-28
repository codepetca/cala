<script lang="ts">
  import { selectedFamilyId } from '$lib/stores.js';
  import type { Family } from '$lib/schema.js';

  type $$Props = {
    families: Family[];
  };

  export let families: Family[];

  function handleFamilyChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedFamilyId.set(target.value || null);
  }
</script>

<div class="flex items-center gap-2">
  <select
    id="family-filter"
    value={$selectedFamilyId || ''}
    on:change={handleFamilyChange}
    class="px-2 py-1 border rounded-md bg-background text-sm min-w-[100px] text-xs"
  >
    <option value="">All</option>
    {#each families as family}
      <option value={family.id}>
        {family.name}
      </option>
    {/each}
  </select>
  
  {#if $selectedFamilyId}
    {@const selectedFamily = families.find(f => f.id === $selectedFamilyId)}
    {#if selectedFamily}
      <span 
        class="inline-block w-3 h-3 rounded-full flex-shrink-0"
        style="background-color: {selectedFamily.color}"
        title={selectedFamily.name}
      ></span>
    {/if}
  {/if}
</div>