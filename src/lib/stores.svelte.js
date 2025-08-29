import { browser } from '$app/environment';

// Storage key for localStorage
const STORAGE_KEY = 'cala-trips';

// Load trips from localStorage
function loadTripsFromStorage() {
  if (!browser) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Parse dates properly
    return parsed.map((trip) => ({
      ...trip,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      events: trip.events.map((event) => ({
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
function saveTripsToStorage(trips) {
  if (!browser) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save trips to localStorage:', e);
  }
}

// Load theme from localStorage
function loadThemeFromStorage() {
  if (!browser) return false;
  
  const stored = localStorage.getItem('theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  
  // Use system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Save theme to localStorage and update DOM
function saveThemeToStorage(isDark) {
  if (!browser) return;
  
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Global state using runes
let trips = $state(loadTripsFromStorage());
let currentTripId = $state(null);
let selectedFamilyId = $state(null);
// Initialize theme state and apply to DOM
function initializeTheme() {
  const initialTheme = loadThemeFromStorage();
  // Apply initial theme to DOM
  if (browser) {
    saveThemeToStorage(initialTheme);
  }
  return initialTheme;
}

let isDarkMode = $state(initializeTheme());

// Manual storage updates will be called when state changes

// Derived values
const currentTrip = $derived(() => {
  if (!currentTripId) return null;
  return trips.find(trip => trip.id === currentTripId) || null;
});

const filteredEvents = $derived(() => {
  const trip = currentTrip();
  if (!trip) return [];
  
  if (!selectedFamilyId) {
    return trip.events;
  }
  
  return trip.events.filter(event => 
    event.familyId === selectedFamilyId || !event.familyId
  );
});

// Functions to access derived values
function getCurrentTrip() {
  return currentTrip();
}

function getFilteredEvents() {
  return filteredEvents();
}

// Trip operations
function addTrip(trip) {
  trips = [...trips, trip];
  saveTripsToStorage(trips);
}

function updateTrip(tripId, updates) {
  trips = trips.map(trip => 
    trip.id === tripId ? { ...trip, ...updates } : trip
  );
  saveTripsToStorage(trips);
}

function deleteTrip(tripId) {
  trips = trips.filter(trip => trip.id !== tripId);
  saveTripsToStorage(trips);
}

// Event operations
function addEvent(tripId, event) {
  trips = trips.map(trip =>
    trip.id === tripId
      ? { ...trip, events: [...trip.events, event] }
      : trip
  );
  saveTripsToStorage(trips);
}

function updateEvent(tripId, eventId, updates) {
  trips = trips.map(trip =>
    trip.id === tripId
      ? {
          ...trip,
          events: trip.events.map(event =>
            event.id === eventId ? { ...event, ...updates } : event
          )
        }
      : trip
  );
  saveTripsToStorage(trips);
}

function deleteEvent(tripId, eventId) {
  trips = trips.map(trip =>
    trip.id === tripId
      ? { ...trip, events: trip.events.filter(event => event.id !== eventId) }
      : trip
  );
  saveTripsToStorage(trips);
}

// Family operations
function addFamily(tripId, family) {
  trips = trips.map(trip =>
    trip.id === tripId
      ? { ...trip, families: [...trip.families, family] }
      : trip
  );
  saveTripsToStorage(trips);
}

function updateFamily(tripId, familyId, updates) {
  trips = trips.map(trip =>
    trip.id === tripId
      ? {
          ...trip,
          families: trip.families.map(family =>
            family.id === familyId ? { ...family, ...updates } : family
          )
        }
      : trip
  );
  saveTripsToStorage(trips);
}

function deleteFamily(tripId, familyId) {
  trips = trips.map(trip =>
    trip.id === tripId
      ? { ...trip, families: trip.families.filter(family => family.id !== familyId) }
      : trip
  );
  saveTripsToStorage(trips);
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  saveThemeToStorage(isDarkMode);
}

// Getter functions for state (since we can't export reassignable state)
function getTrips() {
  return trips;
}

function getCurrentTripId() {
  return currentTripId;
}

function getSelectedFamilyId() {
  return selectedFamilyId;
}

function getIsDarkMode() {
  return isDarkMode;
}

// Setter functions for state
function setCurrentTripId(id) {
  currentTripId = id;
}

function setSelectedFamilyId(id) {
  selectedFamilyId = id;
}

// Export the state and functions
export {
  // State getters
  getTrips,
  getCurrentTripId,
  getSelectedFamilyId,
  getIsDarkMode,
  
  // Derived getters
  getCurrentTrip,
  getFilteredEvents,
  
  // Trip functions
  addTrip,
  updateTrip,
  deleteTrip,
  
  // Event functions
  addEvent,
  updateEvent,
  deleteEvent,
  
  // Family functions
  addFamily,
  updateFamily,
  deleteFamily,
  
  // Theme functions
  toggleTheme,
  
  // Setters
  setCurrentTripId,
  setSelectedFamilyId
};