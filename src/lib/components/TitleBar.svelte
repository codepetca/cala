<script lang="ts">
  import { tripStore } from '$lib/stores';
  
  let editing = $state(false);
  let editValue = $state('');
  
  function startEditing() {
    if (!tripStore.currentTrip) return;
    editing = true;
    editValue = tripStore.currentTrip.name;
  }
  
  function finishEditing() {
    if (!tripStore.currentTrip || !editValue.trim()) {
      editing = false;
      return;
    }
    
    tripStore.updateTrip(tripStore.currentTrip.id, { name: editValue.trim() });
    editing = false;
  }
  
  function cancelEditing() {
    editing = false;
  }
</script>

{#if tripStore.currentTrip}
  <div class="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
    <div class="px-4 py-3">
      {#if editing}
        <input
          bind:value={editValue}
          onblur={finishEditing}
          onkeydown={(e) => e.key === 'Enter' ? finishEditing() : e.key === 'Escape' ? cancelEditing() : null}
          class="text-xl font-bold text-center truncate w-full bg-transparent border-0 outline-none focus:ring-0"
          autofocus
        />
      {:else}
        <h1 
          class="text-xl font-bold text-center truncate cursor-pointer hover:opacity-70 transition-opacity"
          onclick={startEditing}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === 'Enter' && startEditing()}
        >
          {tripStore.currentTrip.name}
        </h1>
      {/if}
    </div>
  </div>
{/if}