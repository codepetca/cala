<script lang="ts">
  import Button from '$lib/components/ui/button.svelte';
  import type { Event, Family } from '$lib/schema.js';

  interface Props {
    open: boolean;
    event: Event | null;
    families: Family[];
    onclose?: () => void;
    onsave?: (event: Event) => void;
    ondelete?: (eventId: string) => void;
  }

  let { open, event, families, onclose, onsave, ondelete }: Props = $props();

  // Event type options
  const eventTypes = [
    { value: 'stay', label: 'Stay 🏨' },
    { value: 'activity', label: 'Activity 🎯' },
    { value: 'meal', label: 'Meal 🍽️' },
    { value: 'transport', label: 'Transport 🚗' },
    { value: 'note', label: 'Note 📝' }
  ];

  let formData = $state<Partial<Event>>({});

  $effect(() => {
    if (event && open) {
      formData = { ...event };
    }
  });

  function handleClose() {
    onclose?.();
  }

  function handleSave() {
    if (!formData.title?.trim()) return;
    
    onsave?.({
      ...event,
      ...formData,
      title: formData.title.trim(),
    } as Event);
    handleClose();
  }

  function handleDelete() {
    if (event?.id) {
      ondelete?.(event.id);
      handleClose();
    }
  }

  function formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    return date.toISOString().slice(0, 16);
  }

  function parseDateFromInput(value: string): Date | undefined {
    return value ? new Date(value) : undefined;
  }
</script>

{#if open}
  <!-- Modal backdrop with reduced opacity -->
  <div 
    class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={handleClose}
    role="button"
    tabindex="-1"
  >
    <!-- Modal content -->
    <div 
      class="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">
            {event?.id ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            type="button"
            onclick={handleClose}
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-4">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium mb-1">Title</label>
            <input
              id="title"
              type="text"
              bind:value={formData.title}
              class="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event title..."
              required
            />
          </div>

          <!-- Type -->
          <div>
            <label for="type" class="block text-sm font-medium mb-1">Type</label>
            <select
              id="type"
              bind:value={formData.type}
              class="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {#each eventTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
          </div>

          <!-- Family -->
          <div>
            <label for="family" class="block text-sm font-medium mb-1">Family</label>
            <select
              id="family"
              bind:value={formData.familyId}
              class="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Shared (all families)</option>
              {#each families as family}
                <option value={family.id}>{family.name}</option>
              {/each}
            </select>
          </div>

          <!-- Start Time -->
          <div>
            <label for="start" class="block text-sm font-medium mb-1">Start Time</label>
            <input
              id="start"
              type="datetime-local"
              value={formatDateForInput(formData.start)}
              onchange={(e) => formData.start = parseDateFromInput(e.currentTarget.value)}
              class="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- End Time -->
          <div>
            <label for="end" class="block text-sm font-medium mb-1">End Time</label>
            <input
              id="end"
              type="datetime-local"
              value={formatDateForInput(formData.end)}
              onchange={(e) => formData.end = parseDateFromInput(e.currentTarget.value)}
              class="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Details -->
          <div>
            <label for="details" class="block text-sm font-medium mb-1">Details</label>
            <textarea
              id="details"
              bind:value={formData.details}
              class="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Additional details..."
              rows="3"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-between pt-4">
            <div>
              {#if event?.id}
                <Button type="button" variant="destructive" onclick={handleDelete} class="rounded-md">
                  Delete
                </Button>
              {/if}
            </div>
            <div class="flex gap-2">
              <Button type="button" variant="secondary" onclick={handleClose} class="rounded-md">
                Cancel
              </Button>
              <Button type="submit" class="rounded-md">
                {event?.id ? 'Save' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}