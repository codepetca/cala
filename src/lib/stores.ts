import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { TripSchema, type Trip, type Event, type Family } from './schema.js';

// Storage key for localStorage
const STORAGE_KEY = 'cala-trips';

// Load trips from localStorage
function loadTripsFromStorage(): Trip[] {
  if (!browser) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Parse dates properly
    return parsed.map((trip: any) => ({
      ...trip,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      events: trip.events.map((event: any) => ({
        ...event,
        start: event.start ? new Date(event.start) : undefined,
        end: event.end ? new Date(event.end) : undefined,
      }))
    }));
  } catch (e) {
    console.error('Failed to load trips from localStorage:', e);
    return [];
  }
}

// Save trips to localStorage
function saveTripsToStorage(trips: Trip[]) {
  if (!browser) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save trips to localStorage:', e);
  }
}

// Create the main trips store using legacy stores for now
function createTripsStore() {
  const { subscribe, set, update } = writable<Trip[]>(loadTripsFromStorage());

  return {
    subscribe,
    set: (trips: Trip[]) => {
      set(trips);
      saveTripsToStorage(trips);
    },
    update: (updater: (trips: Trip[]) => Trip[]) => {
      update((trips) => {
        const newTrips = updater(trips);
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    // Trip CRUD operations
    addTrip: (trip: Trip) => {
      update((trips) => {
        const newTrips = [...trips, trip];
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    updateTrip: (tripId: string, updates: Partial<Trip>) => {
      update((trips) => {
        const newTrips = trips.map(trip => 
          trip.id === tripId ? { ...trip, ...updates } : trip
        );
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    deleteTrip: (tripId: string) => {
      update((trips) => {
        const newTrips = trips.filter(trip => trip.id !== tripId);
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    // Event CRUD operations
    addEvent: (tripId: string, event: Event) => {
      update((trips) => {
        const newTrips = trips.map(trip =>
          trip.id === tripId
            ? { ...trip, events: [...trip.events, event] }
            : trip
        );
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    updateEvent: (tripId: string, eventId: string, updates: Partial<Event>) => {
      update((trips) => {
        const newTrips = trips.map(trip =>
          trip.id === tripId
            ? {
                ...trip,
                events: trip.events.map(event =>
                  event.id === eventId ? { ...event, ...updates } : event
                )
              }
            : trip
        );
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    deleteEvent: (tripId: string, eventId: string) => {
      update((trips) => {
        const newTrips = trips.map(trip =>
          trip.id === tripId
            ? { ...trip, events: trip.events.filter(event => event.id !== eventId) }
            : trip
        );
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    // Family CRUD operations
    addFamily: (tripId: string, family: Family) => {
      update((trips) => {
        const newTrips = trips.map(trip =>
          trip.id === tripId
            ? { ...trip, families: [...trip.families, family] }
            : trip
        );
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    updateFamily: (tripId: string, familyId: string, updates: Partial<Family>) => {
      update((trips) => {
        const newTrips = trips.map(trip =>
          trip.id === tripId
            ? {
                ...trip,
                families: trip.families.map(family =>
                  family.id === familyId ? { ...family, ...updates } : family
                )
              }
            : trip
        );
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    },
    
    deleteFamily: (tripId: string, familyId: string) => {
      update((trips) => {
        const newTrips = trips.map(trip =>
          trip.id === tripId
            ? { ...trip, families: trip.families.filter(family => family.id !== familyId) }
            : trip
        );
        saveTripsToStorage(newTrips);
        return newTrips;
      });
    }
  };
}

export const trips = createTripsStore();

// Current active trip store
export const currentTripId = writable<string | null>(null);

// Derived store for current trip
export const currentTrip = derived(
  [trips, currentTripId],
  ([$trips, $currentTripId]) => {
    if (!$currentTripId) return null;
    return $trips.find(trip => trip.id === $currentTripId) || null;
  }
);

// Filter store for families
export const selectedFamilyId = writable<string | null>(null);

// Derived store for filtered events
export const filteredEvents = derived(
  [currentTrip, selectedFamilyId],
  ([$currentTrip, $selectedFamilyId]) => {
    if (!$currentTrip) return [];
    
    if (!$selectedFamilyId) {
      return $currentTrip.events;
    }
    
    return $currentTrip.events.filter(event => 
      event.familyId === $selectedFamilyId || !event.familyId // include shared events
    );
  }
);

// Theme store
export const isDarkMode = writable<boolean>(false);

// Load theme from localStorage
if (browser) {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark') {
    isDarkMode.set(true);
  } else if (stored === 'light') {
    isDarkMode.set(false);
  } else {
    // Use system preference
    isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
}

// Save theme to localStorage and update DOM
isDarkMode.subscribe((dark) => {
  if (browser) {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});