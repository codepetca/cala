<script lang="ts">
  import { currentTrip, trips } from '$lib/stores.js';
  
  let editing = false;
  let editValue = '';
  
  function startEditing() {
    if (!$currentTrip) return;
    editing = true;
    editValue = $currentTrip.name;
  }
  
  function finishEditing() {
    if (!$currentTrip || !editValue.trim()) {
      editing = false;
      return;
    }
    
    trips.updateTrip($currentTrip.id, { name: editValue.trim() });
    editing = false;
  }
  
  function cancelEditing() {
    editing = false;
  }
</script>

{#if $currentTrip}
  <div class="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
    <div class="px-4 py-3">
      {#if editing}
        <input
          bind:value={editValue}
          on:blur={finishEditing}
          on:keydown={(e) => e.key === 'Enter' ? finishEditing() : e.key === 'Escape' ? cancelEditing() : null}
          class="text-xl font-bold text-center truncate w-full bg-transparent border-0 outline-none focus:ring-0"
          autofocus
        />
      {:else}
        <h1 
          class="text-xl font-bold text-center truncate cursor-pointer hover:opacity-70 transition-opacity"
          on:click={startEditing}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && startEditing()}
        >
          {$currentTrip.name}
        </h1>
      {/if}
    </div>
  </div>
{/if}