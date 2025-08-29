<script lang="ts">
  import { tripStore } from '$lib/stores';
  import Button from './ui/button.svelte';
  import SettingsModal from './SettingsModal.svelte';
  
  let editing = $state(false);
  let editValue = $state('');
  let settingsOpen = $state(false);
  
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
  
  function openSettings() {
    settingsOpen = true;
  }
  
  function closeSettings() {
    settingsOpen = false;
  }
</script>

<nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex h-14 items-center justify-between px-4">
    <!-- Left: Logo -->
    <div class="flex items-center">
      <span class="text-2xl">🏝️</span>
    </div>
    
    <!-- Center: Trip Title -->
    <div class="flex-1 flex justify-center">
      {#if tripStore.currentTrip}
        {#if editing}
          <input
            bind:value={editValue}
            onblur={finishEditing}
            onkeydown={(e) => e.key === 'Enter' ? finishEditing() : e.key === 'Escape' ? cancelEditing() : null}
            class="text-lg font-semibold text-center bg-transparent border-0 outline-none focus:ring-0 max-w-xs"
            autofocus
          />
        {:else}
          <h1 
            class="text-lg font-semibold cursor-pointer hover:opacity-70 transition-opacity max-w-xs truncate"
            onclick={startEditing}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && startEditing()}
          >
            {tripStore.currentTrip.name}
          </h1>
        {/if}
      {/if}
    </div>
    
    <!-- Right side: View Toggle + Filter + Settings -->
    <div class="flex items-center gap-2">
      {#if tripStore.currentTrip}
        <!-- View toggle -->
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-9 w-9" 
          onclick={() => tripStore.toggleViewMode()}
          title={tripStore.currentViewMode === 'calendar' ? 'Switch to list view' : 'Switch to calendar view'}
        >
          {#if tripStore.currentViewMode === 'calendar'}
            <!-- List icon -->
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          {:else}
            <!-- Calendar icon -->
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          {/if}
        </Button>
        
        {#if tripStore.currentTrip.families.length > 0}
          <!-- Filter icon -->
          <Button variant="ghost" size="icon" class="h-9 w-9">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 5.293A1 1 0 013 4.586V4z" />
            </svg>
          </Button>
        {/if}
      {/if}
      
      <!-- Settings icon -->
      <Button variant="ghost" size="icon" class="h-9 w-9" onclick={openSettings}>
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Button>
    </div>
  </div>
</nav>

<!-- Settings Modal -->
<SettingsModal open={settingsOpen} onclose={closeSettings} />