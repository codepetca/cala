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
  
  // Group events by day and unscheduled
  let eventsByDay = $derived((() => {
    const grouped: { [key: string]: Event[] } = {};
    const unscheduled: Event[] = [];
    
    // Initialize days
    tripDays.forEach(day => {
      grouped[day.toDateString()] = [];
    });
    
    // Group events
    filteredEvents.forEach(event => {
      if (event.start) {
        const dayKey = event.start.toDateString();
        if (grouped[dayKey]) {
          grouped[dayKey].push(event);
        }
      } else {
        unscheduled.push(event);
      }
    });
    
    // Sort events within each day
    Object.values(grouped).forEach(dayEvents => {
      dayEvents.sort((a, b) => {
        const aOrder = a.order || 0;
        const bOrder = b.order || 0;
        if (aOrder !== bOrder) return aOrder - bOrder;
        
        if (!a.start && !b.start) return 0;
        if (!a.start) return 1;
        if (!b.start) return -1;
        return a.start.getTime() - b.start.getTime();
      });
    });
    
    // Sort unscheduled by order
    unscheduled.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return { grouped, unscheduled };
  })());

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
      tripStore.updateEvent(trip.id, eventData.id, eventData);
    } else {
      tripStore.addEvent(trip.id, { ...eventData, id: eventData.id || generateId() });
    }
  }

  function handleDeleteEvent(eventId: string) {
    tripStore.deleteEvent(trip.id, eventId);
  }

  // Drag and drop handlers for day sections
  function handleDayConsider(day: Date, e: CustomEvent) {
    const dayKey = day.toDateString();
    const currentEvents = eventsByDay.grouped[dayKey] || [];
    // Update would need to be handled through the store
  }

  function handleDayFinalize(day: Date, e: CustomEvent) {
    const dayKey = day.toDateString();
    const items = e.detail.items.filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
    
    items.forEach((event: Event, index: number) => {
      const originalEvent = filteredEvents.find(e => e.id === event.id);
      if (!originalEvent) return;
      
      const wasMovedFromElsewhere = !originalEvent.start || originalEvent.start.toDateString() !== dayKey;
      
      let eventTime = originalEvent.start;
      if (wasMovedFromElsewhere) {
        eventTime = new Date(day);
        eventTime.setHours(9 + index, 0, 0, 0); // Space events throughout the day
      }
      
      tripStore.updateEvent(trip.id, event.id, {
        start: eventTime,
        order: index
      });
    });
  }

  // Drag and drop for unscheduled
  function handleUnscheduledConsider(e: CustomEvent) {
    // Handle through store updates
  }

  function handleUnscheduledFinalize(e: CustomEvent) {
    const items = e.detail.items.filter((item: any) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
    
    items.forEach((event: Event, index: number) => {
      tripStore.updateEvent(trip.id, event.id, {
        start: undefined,
        end: undefined,
        order: index
      });
    });
  }
</script>

<div class="space-y-4 max-w-2xl mx-auto">
  <!-- Trip Days -->
  {#each tripDays as day (day.toDateString())}
    {@const dayEvents = eventsByDay.grouped[day.toDateString()] || []}
    <div class="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <!-- Day Header -->
      <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-base">
            {formatDate(day)}
          </h2>
          <Button 
            onclick={() => handleNewEvent(day)} 
            variant="ghost" 
            size="sm"
            class="h-8 px-2 text-xs"
          >
            <svg class="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </Button>
        </div>
      </div>
      
      <!-- Day Events -->
      <div class="min-h-[80px]">
        {#if dayEvents.length > 0}
          <div
            use:dndzone={{
              items: dayEvents,
              flipDurationMs: 200,
              dropTargetStyle: {},
              dropFromOthersDisabled: false
            }}
            onconsider={(e) => handleDayConsider(day, e)}
            onfinalize={(e) => handleDayFinalize(day, e)}
          >
            {#each dayEvents as event (event.id)}
              <div animate:flip={{ duration: 200 }}>
                <EventCard
                  {event}
                  family={getFamilyById(event.familyId)}
                  onclick={() => handleEventClick(event)}
                  class="cursor-grab active:cursor-grabbing border-0 rounded-none border-b last:border-b-0 mx-1"
                />
              </div>
            {/each}
          </div>
        {:else}
          <div class="py-8 text-center text-gray-400 text-sm">
            No events scheduled for this day
          </div>
        {/if}
      </div>
    </div>
  {/each}

  <!-- Unscheduled Events -->
  {#if eventsByDay.unscheduled.length > 0}
    <div class="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
        <h2 class="font-semibold text-base">Unscheduled</h2>
      </div>
      
      <!-- Events -->
      <div
        use:dndzone={{
          items: eventsByDay.unscheduled,
          flipDurationMs: 200,
          dropTargetStyle: {},
          dropFromOthersDisabled: false
        }}
        onconsider={handleUnscheduledConsider}
        onfinalize={handleUnscheduledFinalize}
        class="min-h-[80px]"
      >
        {#each eventsByDay.unscheduled as event (event.id)}
          <div animate:flip={{ duration: 200 }}>
            <EventCard
              {event}
              family={getFamilyById(event.familyId)}
              onclick={() => handleEventClick(event)}
              class="cursor-grab active:cursor-grabbing border-0 rounded-none border-b last:border-b-0 mx-1"
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