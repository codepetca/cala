/**
 * Mock data provider for WeekBoard UI development
 * This will be replaced with Convex integration in stage 2
 */

import type { TripEvent, UnscheduledEvent, AllDayEvent, TimedEvent } from '@trip-planner/domain';

// Generate sample data
function createMockEvents(): TripEvent[] {
  const baseDate = new Date('2025-01-13'); // Monday of current week
  
  const events: TripEvent[] = [
    // Unscheduled/Backlog items
    {
      id: 'unsch-1',
      tripId: 'trip-1',
      kind: 'unscheduled',
      title: 'Visit local farmers market',
      notes: 'Check out the fresh produce and artisan goods',
      createdAt: new Date('2025-01-10T09:00:00Z'),
      updatedAt: new Date('2025-01-10T09:00:00Z'),
    },
    {
      id: 'unsch-2', 
      tripId: 'trip-1',
      kind: 'unscheduled',
      title: 'Try the famous pizza place',
      notes: 'Tony recommended this spot - apparently they have amazing Margherita pizza',
      createdAt: new Date('2025-01-10T10:00:00Z'),
      updatedAt: new Date('2025-01-10T10:00:00Z'),
    },
    {
      id: 'unsch-3',
      tripId: 'trip-1', 
      kind: 'unscheduled',
      title: 'Shopping at vintage stores',
      createdAt: new Date('2025-01-10T11:00:00Z'),
      updatedAt: new Date('2025-01-10T11:00:00Z'),
    },
    {
      id: 'unsch-4',
      tripId: 'trip-1',
      kind: 'unscheduled', 
      title: 'Sunset photography session',
      notes: 'Bring the camera and find a good vantage point',
      createdAt: new Date('2025-01-10T12:00:00Z'),
      updatedAt: new Date('2025-01-10T12:00:00Z'),
    },

    // All-day events
    {
      id: 'allday-1',
      tripId: 'trip-1',
      kind: 'allDay',
      title: 'Conference Day 1',
      startDate: new Date('2025-01-13'),
      createdAt: new Date('2025-01-05T09:00:00Z'),
      updatedAt: new Date('2025-01-05T09:00:00Z'),
    },
    {
      id: 'allday-2',
      tripId: 'trip-1',
      kind: 'allDay', 
      title: 'Beach Day',
      startDate: new Date('2025-01-15'),
      createdAt: new Date('2025-01-05T10:00:00Z'),
      updatedAt: new Date('2025-01-05T10:00:00Z'),
    },
    {
      id: 'allday-3',
      tripId: 'trip-1',
      kind: 'allDay',
      title: 'Museum Free Day',
      startDate: new Date('2025-01-16'),
      notes: 'All major museums are free on Thursdays',
      createdAt: new Date('2025-01-05T11:00:00Z'),
      updatedAt: new Date('2025-01-05T11:00:00Z'),
    },

    // Timed events
    {
      id: 'timed-1',
      tripId: 'trip-1',
      kind: 'timed',
      title: 'Flight Arrival', 
      startDateTime: new Date('2025-01-13T10:30:00'),
      endDateTime: new Date('2025-01-13T11:30:00'),
      createdAt: new Date('2025-01-05T09:00:00Z'),
      updatedAt: new Date('2025-01-05T09:00:00Z'),
    },
    {
      id: 'timed-2',
      tripId: 'trip-1', 
      kind: 'timed',
      title: 'Hotel Check-in',
      startDateTime: new Date('2025-01-13T15:00:00'),
      endDateTime: new Date('2025-01-13T15:30:00'),
      createdAt: new Date('2025-01-05T10:00:00Z'),
      updatedAt: new Date('2025-01-05T10:00:00Z'),
    },
    {
      id: 'timed-3',
      tripId: 'trip-1',
      kind: 'timed', 
      title: 'Dinner at Chez Laurent',
      notes: 'Reservation for 2 people, 7:30 PM',
      startDateTime: new Date('2025-01-13T19:30:00'),
      endDateTime: new Date('2025-01-13T21:30:00'),
      createdAt: new Date('2025-01-05T11:00:00Z'),
      updatedAt: new Date('2025-01-05T11:00:00Z'),
    },
    {
      id: 'timed-4',
      tripId: 'trip-1',
      kind: 'timed',
      title: 'Morning Run',
      startDateTime: new Date('2025-01-14T07:00:00'),
      endDateTime: new Date('2025-01-14T08:00:00'),
      createdAt: new Date('2025-01-05T12:00:00Z'),
      updatedAt: new Date('2025-01-05T12:00:00Z'),
    },
    {
      id: 'timed-5',
      tripId: 'trip-1',
      kind: 'timed',
      title: 'Spa Appointment',
      notes: 'Massage therapy session',
      startDateTime: new Date('2025-01-14T14:00:00'),
      endDateTime: new Date('2025-01-14T15:30:00'),
      createdAt: new Date('2025-01-05T13:00:00Z'),
      updatedAt: new Date('2025-01-05T13:00:00Z'),
    },
    {
      id: 'timed-6',
      tripId: 'trip-1',
      kind: 'timed',
      title: 'Gallery Opening',
      startDateTime: new Date('2025-01-17T18:00:00'),
      endDateTime: new Date('2025-01-17T20:00:00'),
      createdAt: new Date('2025-01-05T14:00:00Z'),
      updatedAt: new Date('2025-01-05T14:00:00Z'),
    },
    {
      id: 'timed-7',
      tripId: 'trip-1',
      kind: 'timed',
      title: 'Brunch with Friends',
      startDateTime: new Date('2025-01-18T11:00:00'),
      endDateTime: new Date('2025-01-18T13:00:00'),
      createdAt: new Date('2025-01-05T15:00:00Z'),
      updatedAt: new Date('2025-01-05T15:00:00Z'),
    },
  ];

  return events;
}

// Mock data store
class MockDataStore {
  private events: Map<string, TripEvent> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Initialize with sample data
    const sampleEvents = createMockEvents();
    sampleEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  // Subscribe to changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Query events for a week
  getEventsForWeek(planId: string, startMs: number, endMs: number) {
    const start = new Date(startMs);
    const end = new Date(endMs);
    
    const allEvents = Array.from(this.events.values()).filter(
      event => event.tripId === planId
    );

    const backlog: UnscheduledEvent[] = [];
    const days: Record<string, { allDay: AllDayEvent[]; timed: TimedEvent[] }> = {};

    // Initialize days structure
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      days[dateKey] = { allDay: [], timed: [] };
    }

    allEvents.forEach(event => {
      if (event.kind === 'unscheduled') {
        backlog.push(event);
      } else if (event.kind === 'allDay') {
        const dateKey = event.startDate.toISOString().split('T')[0];
        if (days[dateKey]) {
          days[dateKey].allDay.push(event);
        }
      } else if (event.kind === 'timed') {
        const dateKey = event.startDateTime.toISOString().split('T')[0];
        if (days[dateKey]) {
          days[dateKey].timed.push(event);
        }
      }
    });

    // Sort events
    backlog.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    Object.values(days).forEach(day => {
      day.allDay.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      day.timed.sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
    });

    return { backlog, days };
  }

  // Create new event
  createEvent(eventData: Omit<TripEvent, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date();
    const id = `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const event: TripEvent = {
      ...eventData,
      id,
      createdAt: now,
      updatedAt: now,
    } as TripEvent;

    this.events.set(id, event);
    this.notify();
    
    return event;
  }

  // Update existing event
  updateEvent(id: string, updates: Partial<TripEvent>) {
    const existing = this.events.get(id);
    if (!existing) throw new Error(`Event ${id} not found`);

    const updated: TripEvent = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    } as TripEvent;

    this.events.set(id, updated);
    this.notify();
    
    return updated;
  }

  // Delete event
  deleteEvent(id: string) {
    if (!this.events.has(id)) {
      throw new Error(`Event ${id} not found`);
    }
    
    this.events.delete(id);
    this.notify();
  }

  // Schedule event from backlog to all-day
  scheduleAllDay(id: string, date: string) {
    const event = this.events.get(id);
    if (!event || event.kind !== 'unscheduled') {
      throw new Error(`Unscheduled event ${id} not found`);
    }

    const updated: AllDayEvent = {
      ...event,
      kind: 'allDay',
      startDate: new Date(date + 'T00:00:00'),
      updatedAt: new Date(),
    };

    this.events.set(id, updated);
    this.notify();
    
    return updated;
  }

  // Schedule event from backlog to timed
  scheduleTimed(id: string, startMs: number, endMs: number) {
    const event = this.events.get(id);
    if (!event || event.kind !== 'unscheduled') {
      throw new Error(`Unscheduled event ${id} not found`);
    }

    const updated: TimedEvent = {
      ...event,
      kind: 'timed',
      startDateTime: new Date(startMs),
      endDateTime: new Date(endMs),
      updatedAt: new Date(),
    };

    this.events.set(id, updated);
    this.notify();
    
    return updated;
  }

  // Reschedule timed event
  reschedule(id: string, startMs: number, endMs: number) {
    const event = this.events.get(id);
    if (!event || event.kind !== 'timed') {
      throw new Error(`Timed event ${id} not found`);
    }

    const updated: TimedEvent = {
      ...event,
      startDateTime: new Date(startMs),
      endDateTime: new Date(endMs),
      updatedAt: new Date(),
    };

    this.events.set(id, updated);
    this.notify();
    
    return updated;
  }

  // Unschedule event back to backlog
  unschedule(id: string) {
    const event = this.events.get(id);
    if (!event || event.kind === 'unscheduled') {
      throw new Error(`Scheduled event ${id} not found`);
    }

    const updated: UnscheduledEvent = {
      id: event.id,
      tripId: event.tripId,
      title: event.title,
      notes: event.notes,
      kind: 'unscheduled',
      createdAt: event.createdAt,
      updatedAt: new Date(),
    };

    this.events.set(id, updated);
    this.notify();
    
    return updated;
  }
}

// Global store instance
const mockStore = new MockDataStore();

// Hook interface that matches expected Convex API
export function useMockWeekData(planId: string, startMs: number, endMs: number) {
  const [data, setData] = React.useState(() => 
    mockStore.getEventsForWeek(planId, startMs, endMs)
  );

  React.useEffect(() => {
    const updateData = () => {
      setData(mockStore.getEventsForWeek(planId, startMs, endMs));
    };

    const unsubscribe = mockStore.subscribe(updateData);
    return unsubscribe;
  }, [planId, startMs, endMs]);

  return data;
}

// Mock mutations
export const mockMutations = {
  createEvent: (data: Omit<TripEvent, 'id' | 'createdAt' | 'updatedAt'>) => 
    mockStore.createEvent(data),
  
  scheduleAllDay: (id: string, date: string) => 
    mockStore.scheduleAllDay(id, date),
    
  scheduleTimed: (id: string, startMs: number, endMs: number) => 
    mockStore.scheduleTimed(id, startMs, endMs),
    
  reschedule: (id: string, startMs: number, endMs: number) => 
    mockStore.reschedule(id, startMs, endMs),
    
  unschedule: (id: string) => 
    mockStore.unschedule(id),
    
  updateEvent: (id: string, updates: Partial<TripEvent>) => 
    mockStore.updateEvent(id, updates),
    
  deleteEvent: (id: string) => 
    mockStore.deleteEvent(id),
};

// React import (will be removed when switching to Convex)
import React from 'react';