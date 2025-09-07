/**
 * Domain-Backend Integration Tests
 * 
 * Tests the integration between domain functions and backend Convex operations
 * using our new schema-first architecture.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../../packages/backend/convex/_generated/api';
import { 
  scheduleAsAllDay, 
  scheduleAsTimed, 
  unscheduleEvent,
  hasSchedulingConflict 
} from '@trip-planner/domain/src/functions/event-scheduling';
import { 
  TripEventRefinedSchema,
  UnscheduledEvent,
  AllDayEvent,
  TimedEvent,
} from '@trip-planner/domain/src/schemas/trip-event';

// Mock Convex testing environment
// Note: This would require setting up actual Convex testing infrastructure
describe('Domain-Backend Integration', { skip: true }, () => {
  let convex: ConvexTestingHelper;
  let userId: string;
  let workspaceId: string;
  let tripId: string;

  beforeEach(async () => {
    // Initialize Convex testing helper
    // convex = new ConvexTestingHelper();
    
    // Seed test data
    // userId = await convex.mutation(api.auth.createTestUser, { 
    //   name: 'Test User',
    //   email: 'test@example.com'
    // });
    
    // workspaceId = await convex.mutation(api.workspaces.createWorkspace, {
    //   name: 'Test Workspace'
    // });
    
    // tripId = await convex.mutation(api.trips.createTrip, {
    //   workspaceId,
    //   name: 'Test Trip',
    //   description: 'Integration test trip'
    // });
  });

  describe('Trip Event CRUD Operations', () => {
    it('should create unscheduled trip event through backend', async () => {
      const eventData = {
        tripId,
        title: 'Visit Museum',
        notes: 'Check opening hours',
      };

      // const eventId = await convex.mutation(api.tripEvents.createTripEvent, {
      //   ...eventData,
      //   kind: 'unscheduled'
      // });

      // const event = await convex.query(api.tripEvents.getTripEvents, { tripId });
      // expect(event).toHaveLength(1);
      // expect(event[0].kind).toBe('unscheduled');
      // expect(event[0].title).toBe('Visit Museum');
    });

    it('should schedule event as all-day using domain function', async () => {
      // Create unscheduled event first
      const unscheduledData: UnscheduledEvent = {
        id: 'event-1',
        tripId,
        title: 'Visit Museum',
        notes: 'Check opening hours',
        kind: 'unscheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const scheduledEvent = scheduleAsAllDay(
        unscheduledData,
        new Date('2024-06-15'),
        new Date('2024-06-16')
      );

      // Validate with domain schema
      const validatedEvent = TripEventRefinedSchema.parse(scheduledEvent);
      expect(validatedEvent.kind).toBe('allDay');
      expect(validatedEvent.startDate).toEqual(new Date('2024-06-15'));

      // This would update through backend
      // await convex.mutation(api.tripEvents.updateTripEvent, {
      //   eventId: unscheduledData.id,
      //   kind: 'allDay',
      //   startDate: new Date('2024-06-15').getTime(),
      //   endDate: new Date('2024-06-16').getTime()
      // });
    });

    it('should detect scheduling conflicts', async () => {
      const event1: TimedEvent = {
        id: 'event-1',
        tripId,
        title: 'Meeting 1',
        kind: 'timed',
        startDateTime: new Date('2024-06-15T09:00:00Z'),
        endDateTime: new Date('2024-06-15T12:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const event2: TimedEvent = {
        id: 'event-2',
        tripId,
        title: 'Meeting 2',
        kind: 'timed',
        startDateTime: new Date('2024-06-15T11:00:00Z'),
        endDateTime: new Date('2024-06-15T14:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hasConflict = hasSchedulingConflict(event1, event2);
      expect(hasConflict).toBe(true);

      // Backend should prevent conflicting events
      // await expect(
      //   convex.mutation(api.tripEvents.createTripEvent, {
      //     ...event2,
      //     tripId
      //   })
      // ).rejects.toThrow('Scheduling conflict detected');
    });
  });

  describe('Event State Transitions', () => {
    it('should transition event through all states', async () => {
      // Start with unscheduled
      const unscheduled: UnscheduledEvent = {
        id: 'event-1',
        tripId,
        title: 'Flexible Activity',
        kind: 'unscheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Schedule as all-day
      const allDay = scheduleAsAllDay(unscheduled, new Date('2024-06-15'));
      expect(allDay.kind).toBe('allDay');

      // Convert to timed
      const timed = scheduleAsTimed(
        unscheduled,
        new Date('2024-06-15T09:00:00Z'),
        new Date('2024-06-15T17:00:00Z')
      );
      expect(timed.kind).toBe('timed');

      // Unschedule back
      const backToUnscheduled = unscheduleEvent(timed);
      expect(backToUnscheduled.kind).toBe('unscheduled');
      expect(backToUnscheduled.title).toBe('Flexible Activity');
    });
  });

  describe('Data Validation', () => {
    it('should reject invalid event data through schema validation', async () => {
      const invalidEvent = {
        tripId,
        title: '', // Empty title should fail
        kind: 'unscheduled'
      };

      expect(() => {
        TripEventRefinedSchema.parse(invalidEvent);
      }).toThrow();

      // Backend should also reject this
      // await expect(
      //   convex.mutation(api.tripEvents.createTripEvent, invalidEvent)
      // ).rejects.toThrow('Event title must be between 1 and 100 characters');
    });

    it('should validate date constraints for scheduled events', async () => {
      const invalidAllDay = {
        id: 'event-1',
        tripId,
        title: 'Invalid Event',
        kind: 'allDay' as const,
        startDate: new Date('2024-06-17'),
        endDate: new Date('2024-06-15'), // End before start
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => {
        TripEventRefinedSchema.parse(invalidAllDay);
      }).toThrow('End date must be after or equal to start date');
    });
  });

  describe('AI Domain Bridge Integration', () => {
    it('should work with AI operations', async () => {
      const { AIEventOperations } = await import('@trip-planner/ai');
      
      const unscheduledData = {
        id: 'event-1',
        tripId,
        title: 'AI Created Event',
        notes: 'Created by AI assistant',
      };

      // AI creates event
      const result = AIEventOperations.createUnscheduledEvent(unscheduledData);
      expect(result.success).toBe(true);
      expect(result.data?.kind).toBe('unscheduled');

      // AI schedules event
      if (result.success && result.data) {
        const scheduledResult = AIEventOperations.scheduleAsAllDay(
          result.data,
          '2024-06-15',
          '2024-06-16'
        );
        expect(scheduledResult.success).toBe(true);
        expect(scheduledResult.data?.kind).toBe('allDay');
      }
    });
  });
});