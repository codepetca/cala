<script lang="ts">
  import { onMount } from 'svelte';
  import { tripStore } from '$lib/stores';
  import { generateId, type Trip, type Family, type Event } from '$lib/schemas';
  import CalendarBoard from '$lib/components/CalendarBoard.svelte';
  import Button from '$lib/components/ui/button.svelte';

  let mounted = $state(false);

  onMount(() => {
    mounted = true;
    
    // Force create new sample data (delete this line after testing)
    localStorage.clear();
    
    // Create sample data if no trips exist
    if (tripStore.allTrips.length === 0) {
      createSampleTrip();
    } else {
      // Set the first trip as current
      tripStore.setCurrentTrip(tripStore.allTrips[0].id);
    }
  });

  function createSampleTrip() {
    // Create sample families
    const families: Family[] = [
      {
        id: generateId(),
        name: 'Smith Family',
        color: '#3b82f6' // blue
      },
      {
        id: generateId(), 
        name: 'Johnson Family',
        color: '#ef4444' // red
      }
    ];

    // Create sample trip dates (next week)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Start next week
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4); // 5-day trip

    // Create sample events
    const events: Event[] = [
      {
        id: generateId(),
        tripId: '',
        familyId: families[0].id,
        title: 'Morning Coffee Run',
        type: 'meal',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 7, 30),
        details: 'Local coffee shop downtown',
        order: 0
      },
      {
        id: generateId(),
        tripId: '',
        title: 'City Walking Tour',
        type: 'activity',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 10, 0),
        end: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 12, 30),
        details: 'Guided tour of historic district',
        order: 1
      },
      {
        id: generateId(),
        tripId: '',
        familyId: families[1].id,
        title: 'Lunch at Market',
        type: 'meal',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 13, 0),
        details: 'Try local specialties',
        order: 2
      },
      {
        id: generateId(),
        tripId: '',
        title: 'Museum Visit',
        type: 'activity',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, 11, 0),
        end: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, 15, 0),
        details: 'Art and history museum',
        order: 0
      },
      {
        id: generateId(),
        tripId: '',
        familyId: families[0].id,
        title: 'Sunset Bike Ride',
        type: 'activity',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, 17, 30),
        details: 'Rent bikes at waterfront',
        order: 1
      },
      {
        id: generateId(),
        tripId: '',
        title: 'Pizza Night',
        type: 'meal',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1, 19, 30),
        details: 'Famous local pizza place',
        order: 2
      },
      {
        id: generateId(),
        tripId: '',
        familyId: families[1].id,
        title: 'Hiking Trail',
        type: 'activity',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 2, 8, 30),
        end: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 2, 14, 0),
        details: 'Scenic mountain trail - bring water',
        order: 0
      },
      {
        id: generateId(),
        tripId: '',
        title: 'Shopping District',
        type: 'activity',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 2, 15, 30),
        details: 'Browse local shops and boutiques',
        order: 1
      },
      {
        id: generateId(),
        tripId: '',
        title: 'Rooftop Dinner',
        type: 'meal',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 2, 20, 0),
        details: 'City views restaurant',
        order: 2
      },
      {
        id: generateId(),
        tripId: '',
        familyId: families[0].id,
        title: 'Farmers Market',
        type: 'activity',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 3, 9, 0),
        details: 'Fresh produce and local goods',
        order: 0
      },
      {
        id: generateId(),
        tripId: '',
        title: 'Cooking Class',
        type: 'activity',
        start: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 3, 14, 0),
        end: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 3, 17, 0),
        details: 'Learn to make local cuisine',
        order: 1
      },
      {
        id: generateId(),
        tripId: '',
        title: 'Departure Prep',
        type: 'note',
        details: 'Pack bags and check flight times',
        order: 0
      }
    ];

    // Create the trip
    const trip: Trip = {
      id: generateId(),
      name: 'Hawaii Family Vacation',
      startDate,
      endDate,
      families,
      events: events.map(event => ({ ...event, tripId: generateId() }))
    };

    // Update event tripIds
    trip.events = trip.events.map(event => ({ ...event, tripId: trip.id }));

    // Add to store and set as current
    tripStore.addTrip(trip);
    tripStore.setCurrentTrip(trip.id);
  }

  function createNewTrip() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);

    const newTrip: Trip = {
      id: generateId(),
      name: 'New Trip',
      startDate,
      endDate,
      families: [],
      events: []
    };

    tripStore.addTrip(newTrip);
    tripStore.setCurrentTrip(newTrip.id);
  }

</script>

{#if mounted}
  {#if tripStore.currentTrip}
    <CalendarBoard 
      trip={tripStore.currentTrip} 
      filteredEvents={tripStore.filteredEvents}
      oneventclick={(event) => console.log('Event clicked:', event)}
    />
  {:else}
    <div class="text-center py-12">
      <h2 class="text-xl font-semibold mb-4">No trips found</h2>
      <p class="text-gray-500 mb-6">Create your first trip to get started!</p>
      <Button onclick={createNewTrip}>
        Create New Trip
      </Button>
    </div>
  {/if}
{:else}
  <div class="text-center py-12">
    <p class="text-gray-500">Loading...</p>
  </div>
{/if}
