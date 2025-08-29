import { storageRepository } from '$lib/repositories/storageRepository';
import { generateId, parseTrip, parseEvent, parseFamily, type Trip, type Event, type Family } from '$lib/schemas';
import { getTripDays } from '$lib/utils/trip.utils';

/**
 * Trip store using Svelte 5 runes
 * Manages trips, events, families, and filtering state
 */
class TripStore {
  // Core reactive state
  private trips = $state<Trip[]>([]);
  private currentTripId = $state<string | null>(null);
  private selectedFamilyId = $state<string | null>(null);

  // Derived reactive values
  currentTrip = $derived(
    this.currentTripId 
      ? this.trips.find(trip => trip.id === this.currentTripId) ?? null
      : null
  );

  // Filtered events based on selected family
  filteredEvents = $derived((() => {
    const trip = this.currentTrip;
    if (!trip) return [];

    if (!this.selectedFamilyId) {
      return trip.events;
    }

    return trip.events.filter(event => 
      event.familyId === this.selectedFamilyId || !event.familyId
    );
  })());

  // Trip days for calendar display
  tripDays = $derived((() => {
    const trip = this.currentTrip;
    return trip ? getTripDays(trip) : [];
  })());

  // All trips (getter)
  allTrips = $derived(this.trips);

  // Current trip families
  currentFamilies = $derived(this.currentTrip?.families ?? []);

  // Stats for current trip
  tripStats = $derived((() => {
    const trip = this.currentTrip;
    if (!trip) return null;

    const events = trip.events;
    return {
      totalEvents: events.length,
      scheduledEvents: events.filter(e => e.start).length,
      unscheduledEvents: events.filter(e => !e.start).length,
      familyCount: trip.families.length,
    };
  })());

  constructor() {
    this.loadFromStorage();
  }

  // === Trip Operations ===

  /**
   * Add a new trip
   */
  addTrip(tripData: Partial<Trip>): Trip {
    const trip = parseTrip({
      id: generateId(),
      families: [],
      events: [],
      ...tripData,
    });

    this.trips = [...this.trips, trip];
    this.persist();
    
    return trip;
  }

  /**
   * Update a trip
   */
  updateTrip(tripId: string, updates: Partial<Trip>): void {
    this.trips = this.trips.map(trip =>
      trip.id === tripId ? { ...trip, ...updates } : trip
    );
    this.persist();
  }

  /**
   * Delete a trip
   */
  deleteTrip(tripId: string): void {
    this.trips = this.trips.filter(trip => trip.id !== tripId);
    
    // Clear current trip if it was deleted
    if (this.currentTripId === tripId) {
      this.currentTripId = null;
    }
    
    this.persist();
  }

  /**
   * Set the current active trip
   */
  setCurrentTrip(tripId: string | null): void {
    this.currentTripId = tripId;
  }

  // === Event Operations ===

  /**
   * Add an event to a trip
   */
  addEvent(tripId: string, eventData: Partial<Event>): Event {
    const event = parseEvent({
      id: generateId(),
      tripId,
      order: 0,
      ...eventData,
    });

    this.trips = this.trips.map(trip =>
      trip.id === tripId
        ? { ...trip, events: [...trip.events, event] }
        : trip
    );
    
    this.persist();
    return event;
  }

  /**
   * Update an event
   */
  updateEvent(tripId: string, eventId: string, updates: Partial<Event>): void {
    this.trips = this.trips.map(trip =>
      trip.id === tripId
        ? {
            ...trip,
            events: trip.events.map(event =>
              event.id === eventId ? { ...event, ...updates } : event
            )
          }
        : trip
    );
    
    this.persist();
  }

  /**
   * Delete an event
   */
  deleteEvent(tripId: string, eventId: string): void {
    this.trips = this.trips.map(trip =>
      trip.id === tripId
        ? { ...trip, events: trip.events.filter(event => event.id !== eventId) }
        : trip
    );
    
    this.persist();
  }

  /**
   * Reorder events (useful for drag & drop)
   */
  reorderEvents(tripId: string, eventIds: string[]): void {
    this.trips = this.trips.map(trip => {
      if (trip.id !== tripId) return trip;

      const eventMap = new Map(trip.events.map(e => [e.id, e]));
      const reorderedEvents = eventIds
        .map((id, index) => {
          const event = eventMap.get(id);
          return event ? { ...event, order: index } : null;
        })
        .filter(Boolean) as Event[];

      return { ...trip, events: reorderedEvents };
    });

    this.persist();
  }

  // === Family Operations ===

  /**
   * Add a family to a trip
   */
  addFamily(tripId: string, familyData: Partial<Family>): Family {
    const family = parseFamily({
      id: generateId(),
      ...familyData,
    });

    this.trips = this.trips.map(trip =>
      trip.id === tripId
        ? { ...trip, families: [...trip.families, family] }
        : trip
    );
    
    this.persist();
    return family;
  }

  /**
   * Update a family
   */
  updateFamily(tripId: string, familyId: string, updates: Partial<Family>): void {
    this.trips = this.trips.map(trip =>
      trip.id === tripId
        ? {
            ...trip,
            families: trip.families.map(family =>
              family.id === familyId ? { ...family, ...updates } : family
            )
          }
        : trip
    );
    
    this.persist();
  }

  /**
   * Delete a family
   */
  deleteFamily(tripId: string, familyId: string): void {
    this.trips = this.trips.map(trip =>
      trip.id === tripId
        ? { 
            ...trip, 
            families: trip.families.filter(family => family.id !== familyId),
            // Remove family association from events
            events: trip.events.map(event => 
              event.familyId === familyId 
                ? { ...event, familyId: undefined }
                : event
            )
          }
        : trip
    );
    
    this.persist();
  }

  // === Filter Operations ===

  /**
   * Set family filter
   */
  setFamilyFilter(familyId: string | null): void {
    this.selectedFamilyId = familyId;
  }

  /**
   * Clear family filter
   */
  clearFamilyFilter(): void {
    this.selectedFamilyId = null;
  }

  /**
   * Get current family filter
   */
  getCurrentFamilyFilter(): string | null {
    return this.selectedFamilyId;
  }

  // === Utility Methods ===

  /**
   * Find an event by ID in current trip
   */
  findEvent(eventId: string): Event | null {
    return this.currentTrip?.events.find(e => e.id === eventId) ?? null;
  }

  /**
   * Find a family by ID in current trip
   */
  findFamily(familyId: string): Family | null {
    return this.currentTrip?.families.find(f => f.id === familyId) ?? null;
  }

  /**
   * Get events for a specific date
   */
  getEventsForDate(date: Date): Event[] {
    if (!this.currentTrip) return [];

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return this.filteredEvents.filter(event => {
      if (!event.start) return false;
      
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      
      return eventDate.getTime() === targetDate.getTime();
    });
  }

  /**
   * Get unscheduled events (no start time)
   */
  getUnscheduledEvents(): Event[] {
    return this.filteredEvents.filter(event => !event.start);
  }

  // === Persistence ===

  /**
   * Load trips from storage
   */
  private loadFromStorage(): void {
    this.trips = storageRepository.loadTrips();
  }

  /**
   * Persist trips to storage
   */
  private persist(): void {
    storageRepository.saveTrips(this.trips);
  }

  /**
   * Clear all data (useful for development/testing)
   */
  clearAll(): void {
    this.trips = [];
    this.currentTripId = null;
    this.selectedFamilyId = null;
    storageRepository.clearAll();
  }
}

// Export singleton instance
export const tripStore = new TripStore();