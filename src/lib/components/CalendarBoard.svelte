<script lang="ts">
  import { dndzone, TRIGGERS, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import EventCard from './EventCard.svelte';
  import EventModal from './EventModal.svelte';
  import Button from './ui/button.svelte';
  import { tripStore } from '$lib/stores';
  import { generateId, type Trip, type Event, type Family } from '$lib/schemas';
  import { getTripDays, formatDate } from '$lib/utils/trip.utils';

  interface Props {
    trip: Trip;
    filteredEvents: Event[];
    oneventclick?: (event: Event) => void;
  }

  let { trip, filteredEvents, oneventclick }: Props = $props();


  // Modal state
  let modalOpen = $state(false);
  let selectedEvent = $state<Event | null>(null);

  // Get trip days
  let tripDays = $derived(getTripDays(trip));
  
  // Local state for drag operations - synced with store data
  let dayArrays = $state<{ [key: string]: Event[] }>({});
  let unscheduledItems = $state<Event[]>([]);
  let isDragging = $state(false);
  
  // Time selection during drag
  let draggedOverDay = $state<Date | null>(null);
  
  // Sync local state with store data only when not dragging
  $effect(() => {
    if (!isDragging) {
      syncLocalState(filteredEvents, tripDays);
    }
  });
  
  function syncLocalState(events: Event[], days: Date[]) {
    dayArrays = createDayArrays(events, days);
    unscheduledItems = events.filter(event => !event.start)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  function createDayArrays(events: Event[], days: Date[]) {
    const arrays: { [key: string]: Event[] } = {};
    
    // Initialize arrays for each day
    days.forEach(day => {
      arrays[day.toDateString()] = [];
    });
    
    // Sort events into day arrays
    events.forEach(event => {
      if (event.start) {
        const dayKey = event.start.toDateString();
        if (arrays[dayKey]) {
          arrays[dayKey].push(event);
        }
      }
    });
    
    // Sort events within each day by order, then by time
    Object.values(arrays).forEach(dayEvents => {
      dayEvents.sort((a, b) => {
        // First sort by order if both have it
        const aOrder = a.order || 0;
        const bOrder = b.order || 0;
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        // Then by start time
        if (!a.start && !b.start) return 0;
        if (!a.start) return 1;
        if (!b.start) return -1;
        return a.start.getTime() - b.start.getTime();
      });
    });
    
    return arrays;
  }

  function getFamilyById(familyId: string | undefined): Family | undefined {
    if (!familyId) return undefined;
    return trip.families.find(f => f.id === familyId);
  }


  function handleEventClick(event: Event) {
    selectedEvent = event;
    modalOpen = true;
    oneventclick?.(event);
  }

  function handleNewEvent(day?: Date) {
    const newEvent: Event = {
      id: generateId(),
      tripId: trip.id,
      title: '',
      type: 'activity',
      start: day ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0) : undefined,
      order: 0
    };
    selectedEvent = newEvent;
    modalOpen = true;
  }

  function handleSaveEvent(eventData: Event) {
    if (eventData.id && filteredEvents.find(e => e.id === eventData.id)) {
      // Update existing event
      tripStore.updateEvent(trip.id, eventData.id, eventData);
    } else {
      // Create new event
      tripStore.addEvent(trip.id, { ...eventData, id: eventData.id || generateId() });
    }
  }

  function handleDeleteEvent(eventId: string) {
    tripStore.deleteEvent(trip.id, eventId);
  }


  // Drag and drop handlers
  function handleDayConsider(day: Date, e: CustomEvent) {
    isDragging = true;
    draggedOverDay = day;
    
    const dayKey = day.toDateString();
    dayArrays[dayKey] = e.detail.items;
  }

  function handleDayFinalize(day: Date, e: CustomEvent) {
    const dayKey = day.toDateString();
    const items = e.detail.items.filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
    
    // Update local state
    dayArrays[dayKey] = items;
    
    // Only update the dragged event's time, keep existing events' times unchanged
    items.forEach((event: Event, index: number) => {
      const originalEvent = filteredEvents.find(e => e.id === event.id);
      if (!originalEvent) return;
      
      // Check if this event was moved from elsewhere (different day or no time)
      const wasMovedFromElsewhere = !originalEvent.start || originalEvent.start.toDateString() !== dayKey;
      
      let eventTime = originalEvent.start; // Keep original time by default
      
      // Only calculate new time for events that were moved from elsewhere
      if (wasMovedFromElsewhere) {
        // Get events that were already on this day (not moved)
        const existingDayEvents = filteredEvents
          .filter(e => e.start && e.start.toDateString() === dayKey && e.id !== event.id)
          .sort((a, b) => a.start!.getTime() - b.start!.getTime());
        
        if (existingDayEvents.length === 0) {
          // No existing events - set to noon
          eventTime = new Date(day);
          eventTime.setHours(12, 0, 0, 0);
        } else {
          // Find a reasonable time based on position
          if (index === 0) {
            // Dropped at beginning - 1 hour before first existing event
            eventTime = new Date(existingDayEvents[0].start!);
            eventTime.setHours(eventTime.getHours() - 1);
          } else {
            // Dropped after - 1 hour after last existing event
            eventTime = new Date(existingDayEvents[existingDayEvents.length - 1].start!);
            eventTime.setHours(eventTime.getHours() + 1);
          }
          
          // Check if time is within day bounds
          const dayStart = new Date(day);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(day);
          dayEnd.setHours(23, 59, 59, 999);
          
          if (eventTime < dayStart || eventTime > dayEnd) {
            eventTime = undefined;
          }
        }
      }
      
      const updatedData: Partial<Event> = {
        start: eventTime,
        order: index
      };
      
      tripStore.updateEvent(trip.id, event.id, updatedData);
    });
    
    // Clear drag state
    draggedOverDay = null;
    
    // Re-enable sync after store updates
    setTimeout(() => {
      isDragging = false;
    }, 50);
  }

  function handleUnscheduledConsider(e: CustomEvent) {
    isDragging = true;
    draggedOverDay = null; // Clear day when over unscheduled
    unscheduledItems = e.detail.items;
  }

  function handleUnscheduledFinalize(e: CustomEvent) {
    const items = e.detail.items.filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
    
    // Update local state
    unscheduledItems = items;
    
    // Update the store with the new positions
    items.forEach((event: Event, index: number) => {
      const updatedData: Partial<Event> = {
        start: undefined,
        end: undefined,
        order: index
      };
      
      tripStore.updateEvent(trip.id, event.id, updatedData);
    });
    
    // Clear drag state
    draggedOverDay = null;
    
    // Re-enable sync after store updates
    setTimeout(() => {
      isDragging = false;
    }, 50);
  }
</script>

<div class="space-y-2">
  <!-- Calendar Grid -->
  <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {#each tripDays as day (day.toDateString())}
      {@const dayEvents = dayArrays[day.toDateString()] || []}
      <div class="bg-white dark:bg-gray-900 rounded-lg overflow-hidden relative">
        <!-- Day Header -->
        <div class="px-3 py-1 bg-gray-50 dark:bg-gray-700">
          <h3 class="font-medium text-xs">
            {formatDate(day)}
          </h3>
        </div>
        
        <!-- Events Container -->
        <div
          use:dndzone={{
            items: dayEvents,
            flipDurationMs: 200,
            dropTargetStyle: {},
            dropFromOthersDisabled: false,
            dragDisabled: false,
            transformDraggedElement: (element, data, index) => {
              element.classList.add('is-being-dragged');
              element.style.outline = 'none';
              element.style.opacity = '0.9';
              // Set solid background based on theme
              const isDark = document.documentElement.classList.contains('dark');
              const bgColor = isDark ? 'rgb(17 24 39)' : 'rgb(255 255 255)';
              element.style.backgroundColor = bgColor;
              element.style.setProperty('background-color', bgColor, 'important');
            }
          }}
          onconsider={(e) => handleDayConsider(day, e)}
          onfinalize={(e) => handleDayFinalize(day, e)}
          role="region"
          aria-label="Day events container"
          class="relative"
        >
          {#each dayEvents as event (event.id)}
            <div animate:flip={{ duration: 200 }}>
              <EventCard
                {event}
                family={getFamilyById(event.familyId)}
                onclick={() => handleEventClick(event)}
                class="touch-manipulation cursor-grab active:cursor-grabbing border-0 rounded-none border-b last:border-b-0"
              />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Unscheduled Events -->
  {#if unscheduledItems.length > 0}
    <div class="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="px-3 py-2 bg-gray-50 dark:bg-gray-700">
        <h3 class="font-medium text-sm">Unscheduled</h3>
      </div>
      
      <!-- Events -->
      <div
        use:dndzone={{
          items: unscheduledItems,
          flipDurationMs: 200,
          dropTargetStyle: {},
          dropFromOthersDisabled: false,
          transformDraggedElement: (element, data, index) => {
            element.classList.add('is-being-dragged');
            element.style.outline = 'none';
            element.style.opacity = '0.9';
            // Set solid background based on theme
            const isDark = document.documentElement.classList.contains('dark');
            const bgColor = isDark ? 'rgb(17 24 39)' : 'rgb(255 255 255)';
            element.style.backgroundColor = bgColor;
            element.style.setProperty('background-color', bgColor, 'important');
          }
        }}
        onconsider={handleUnscheduledConsider}
        onfinalize={handleUnscheduledFinalize}
        class=""
      >
        {#each unscheduledItems as event (event.id)}
          <div animate:flip={{ duration: 200 }}>
            <EventCard
              {event}
              family={getFamilyById(event.familyId)}
              onclick={() => handleEventClick(event)}
              class="touch-manipulation cursor-grab active:cursor-grabbing border-0 rounded-none border-b last:border-b-0"
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Floating Action Button -->
<div class="fixed bottom-6 right-6 z-10">
  <Button 
    onclick={() => handleNewEvent()} 
    class="h-14 w-14 !rounded-full shadow-lg hover:shadow-xl transition-shadow"
  >
    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  </Button>
</div>

<!-- Event Modal -->
<EventModal
  open={modalOpen}
  event={selectedEvent}
  families={trip.families}
  onclose={() => { modalOpen = false; selectedEvent = null; }}
  onsave={handleSaveEvent}
  ondelete={handleDeleteEvent}
/>