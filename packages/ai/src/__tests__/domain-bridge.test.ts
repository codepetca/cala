/**
 * AI Domain Bridge Tests
 */

import { describe, it, expect } from 'vitest';
import { AIEventOperations, AISchemaUtils } from '../domain-bridge';
import { UnscheduledEvent, AllDayEvent, TimedEvent } from '@trip-planner/domain/src/schemas/trip-event';

describe('AIEventOperations', () => {
  const mockUnscheduledEvent: UnscheduledEvent = {
    id: 'event-1',
    tripId: 'trip-1',
    title: 'Visit Museum',
    notes: 'Check opening hours',
    kind: 'unscheduled',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  describe('validateEvent', () => {
    it('should validate a correct event', () => {
      const result = AIEventOperations.validateEvent(mockUnscheduledEvent);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUnscheduledEvent);
    });

    it('should reject invalid event data', () => {
      const result = AIEventOperations.validateEvent({
        id: 'event-1',
        // missing required fields
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.type).toBe('validation');
    });
  });

  describe('scheduleAsAllDay', () => {
    it('should schedule event as all-day with Date objects', () => {
      const startDate = new Date('2024-06-15');
      const result = AIEventOperations.scheduleAsAllDay(mockUnscheduledEvent, startDate);
      
      expect(result.success).toBe(true);
      expect(result.data!.kind).toBe('allDay');
      expect(result.data!.startDate).toEqual(startDate);
    });

    it('should schedule event as all-day with date strings', () => {
      const result = AIEventOperations.scheduleAsAllDay(
        mockUnscheduledEvent, 
        '2024-06-15', 
        '2024-06-17'
      );
      
      expect(result.success).toBe(true);
      expect(result.data!.kind).toBe('allDay');
    });

    it('should handle invalid date range', () => {
      const result = AIEventOperations.scheduleAsAllDay(
        mockUnscheduledEvent, 
        '2024-06-17', 
        '2024-06-15'
      );
      
      expect(result.success).toBe(false);
      expect(result.error!.type).toBe('business_logic');
    });
  });

  describe('scheduleAsTimed', () => {
    it('should schedule event as timed with Date objects', () => {
      const startDateTime = new Date('2024-06-15T09:00:00Z');
      const endDateTime = new Date('2024-06-15T17:00:00Z');
      
      const result = AIEventOperations.scheduleAsTimed(
        mockUnscheduledEvent, 
        startDateTime, 
        endDateTime
      );
      
      expect(result.success).toBe(true);
      expect(result.data!.kind).toBe('timed');
      expect(result.data!.startDateTime).toEqual(startDateTime);
    });

    it('should schedule event as timed with date strings', () => {
      const result = AIEventOperations.scheduleAsTimed(
        mockUnscheduledEvent, 
        '2024-06-15T09:00:00Z', 
        '2024-06-15T17:00:00Z'
      );
      
      expect(result.success).toBe(true);
      expect(result.data!.kind).toBe('timed');
    });

    it('should handle invalid time range', () => {
      const result = AIEventOperations.scheduleAsTimed(
        mockUnscheduledEvent, 
        '2024-06-15T17:00:00Z', 
        '2024-06-15T09:00:00Z'
      );
      
      expect(result.success).toBe(false);
      expect(result.error!.type).toBe('business_logic');
    });
  });

  describe('convertEvent', () => {
    const timedEvent: TimedEvent = {
      ...mockUnscheduledEvent,
      kind: 'timed',
      startDateTime: new Date('2024-06-15T09:00:00Z'),
      endDateTime: new Date('2024-06-15T17:00:00Z'),
    };

    it('should convert timed event to unscheduled', () => {
      const result = AIEventOperations.convertEvent(timedEvent, 'unscheduled');
      
      expect(result.success).toBe(true);
      expect(result.data!.kind).toBe('unscheduled');
    });

    it('should convert timed event to all-day', () => {
      const result = AIEventOperations.convertEvent(
        timedEvent, 
        'allDay',
        { startDate: '2024-06-15' }
      );
      
      expect(result.success).toBe(true);
      expect(result.data!.kind).toBe('allDay');
    });

    it('should require schedule data for unscheduled to timed conversion', () => {
      const result = AIEventOperations.convertEvent(mockUnscheduledEvent, 'timed');
      
      expect(result.success).toBe(false);
      expect(result.error!.type).toBe('validation');
      expect(result.error!.field).toBe('startDateTime');
    });
  });

  describe('checkConflict', () => {
    const timedEvent1: TimedEvent = {
      ...mockUnscheduledEvent,
      id: 'event-1',
      kind: 'timed',
      startDateTime: new Date('2024-06-15T09:00:00Z'),
      endDateTime: new Date('2024-06-15T12:00:00Z'),
    };

    const timedEvent2: TimedEvent = {
      ...mockUnscheduledEvent,
      id: 'event-2',
      kind: 'timed',
      startDateTime: new Date('2024-06-15T11:00:00Z'),
      endDateTime: new Date('2024-06-15T14:00:00Z'),
    };

    it('should detect overlapping timed events', () => {
      const result = AIEventOperations.checkConflict(timedEvent1, timedEvent2);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should not detect conflicts for unscheduled events', () => {
      const result = AIEventOperations.checkConflict(mockUnscheduledEvent, mockUnscheduledEvent);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });

  describe('getDateRange', () => {
    it('should return "Unscheduled" for unscheduled events', () => {
      const result = AIEventOperations.getDateRange(mockUnscheduledEvent);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('Unscheduled');
    });

    it('should format timed event date range', () => {
      const timedEvent: TimedEvent = {
        ...mockUnscheduledEvent,
        kind: 'timed',
        startDateTime: new Date('2024-06-15T09:00:00Z'),
        endDateTime: new Date('2024-06-15T17:00:00Z'),
      };

      const result = AIEventOperations.getDateRange(timedEvent);
      
      expect(result.success).toBe(true);
      expect(result.data).toContain('2024-06-15');
    });
  });

  describe('createUnscheduledEvent', () => {
    it('should create valid unscheduled event', () => {
      const eventData = {
        id: 'new-event',
        tripId: 'trip-1',
        title: 'New Event',
        notes: 'Event notes',
      };

      const result = AIEventOperations.createUnscheduledEvent(eventData);
      
      expect(result.success).toBe(true);
      expect(result.data!.kind).toBe('unscheduled');
      expect(result.data!.title).toBe('New Event');
      expect(result.data!.createdAt).toBeInstanceOf(Date);
    });

    it('should reject invalid event data', () => {
      const result = AIEventOperations.createUnscheduledEvent({
        id: 'new-event',
        tripId: 'trip-1',
        title: '', // Invalid empty title
      });
      
      expect(result.success).toBe(false);
      expect(result.error!.type).toBe('validation');
    });
  });
});

describe('AISchemaUtils', () => {
  describe('validateTrip', () => {
    const validTripData = {
      id: 'trip-1',
      workspaceId: 'ws-1',
      name: 'Japan Trip',
      description: 'Two week adventure',
      timezone: 'Asia/Tokyo',
      isPublic: false,
      shareSlug: 'japan-2024',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should validate correct trip data', () => {
      const result = AISchemaUtils.validateTrip(validTripData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validTripData);
    });

    it('should reject invalid trip data', () => {
      const result = AISchemaUtils.validateTrip({
        id: 'trip-1',
        // missing required fields
      });
      
      expect(result.success).toBe(false);
      expect(result.error!.type).toBe('validation');
    });
  });

  describe('getEventKind', () => {
    it('should return event kind for valid event', () => {
      const kind = AISchemaUtils.getEventKind({
        id: 'event-1',
        tripId: 'trip-1',
        title: 'Event',
        kind: 'allDay',
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      expect(kind).toBe('allDay');
    });

    it('should return null for invalid event', () => {
      const kind = AISchemaUtils.getEventKind({
        id: 'event-1',
        // missing required fields
      });
      
      expect(kind).toBeNull();
    });
  });
});