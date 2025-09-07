/**
 * Event Scheduling Domain Functions Tests
 */

import { describe, it, expect } from 'vitest';
import { 
  scheduleAsAllDay, 
  scheduleAsTimed, 
  unscheduleEvent,
  hasSchedulingConflict,
  getEventDateRange 
} from '../event-scheduling';
import { UnscheduledEvent, TimedEvent } from '../../schemas/trip-event';

describe('Event Scheduling Functions', () => {
  const mockUnscheduledEvent: UnscheduledEvent = {
    id: 'event-1',
    tripId: 'trip-1',
    title: 'Visit Museum',
    notes: 'Check opening hours',
    kind: 'unscheduled',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  describe('scheduleAsAllDay', () => {
    it('should convert unscheduled event to all-day event', () => {
      const startDate = new Date('2024-06-15');
      const result = scheduleAsAllDay(mockUnscheduledEvent, startDate);

      expect(result.kind).toBe('allDay');
      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toEqual(startDate);
      expect(result.title).toBe(mockUnscheduledEvent.title);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle multi-day all-day events', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-06-17');
      const result = scheduleAsAllDay(mockUnscheduledEvent, startDate, endDate);

      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toEqual(endDate);
    });

    it('should throw error for invalid date range', () => {
      const startDate = new Date('2024-06-17');
      const endDate = new Date('2024-06-15'); // end before start

      expect(() => {
        scheduleAsAllDay(mockUnscheduledEvent, startDate, endDate);
      }).toThrow('End date must be after or equal to start date');
    });
  });

  describe('scheduleAsTimed', () => {
    it('should convert unscheduled event to timed event', () => {
      const startDateTime = new Date('2024-06-15T09:00:00Z');
      const endDateTime = new Date('2024-06-15T17:00:00Z');
      const result = scheduleAsTimed(mockUnscheduledEvent, startDateTime, endDateTime);

      expect(result.kind).toBe('timed');
      expect(result.startDateTime).toEqual(startDateTime);
      expect(result.endDateTime).toEqual(endDateTime);
      expect(result.title).toBe(mockUnscheduledEvent.title);
    });

    it('should throw error for invalid time range', () => {
      const startDateTime = new Date('2024-06-15T17:00:00Z');
      const endDateTime = new Date('2024-06-15T09:00:00Z'); // end before start

      expect(() => {
        scheduleAsTimed(mockUnscheduledEvent, startDateTime, endDateTime);
      }).toThrow('End time must be after start time');
    });
  });

  describe('unscheduleEvent', () => {
    it('should convert timed event back to unscheduled', () => {
      const timedEvent: TimedEvent = {
        ...mockUnscheduledEvent,
        kind: 'timed',
        startDateTime: new Date('2024-06-15T09:00:00Z'),
        endDateTime: new Date('2024-06-15T17:00:00Z'),
      };

      const result = unscheduleEvent(timedEvent);

      expect(result.kind).toBe('unscheduled');
      expect(result.title).toBe(timedEvent.title);
      expect(result.notes).toBe(timedEvent.notes);
      expect('startDateTime' in result).toBe(false);
      expect('endDateTime' in result).toBe(false);
    });
  });

  describe('hasSchedulingConflict', () => {
    it('should detect overlapping timed events', () => {
      const event1: TimedEvent = {
        ...mockUnscheduledEvent,
        kind: 'timed',
        startDateTime: new Date('2024-06-15T09:00:00Z'),
        endDateTime: new Date('2024-06-15T12:00:00Z'),
      };

      const event2: TimedEvent = {
        ...mockUnscheduledEvent,
        id: 'event-2',
        kind: 'timed',
        startDateTime: new Date('2024-06-15T11:00:00Z'),
        endDateTime: new Date('2024-06-15T14:00:00Z'),
      };

      expect(hasSchedulingConflict(event1, event2)).toBe(true);
    });

    it('should not detect conflicts for non-overlapping events', () => {
      const event1: TimedEvent = {
        ...mockUnscheduledEvent,
        kind: 'timed',
        startDateTime: new Date('2024-06-15T09:00:00Z'),
        endDateTime: new Date('2024-06-15T12:00:00Z'),
      };

      const event2: TimedEvent = {
        ...mockUnscheduledEvent,
        id: 'event-2',
        kind: 'timed',
        startDateTime: new Date('2024-06-15T13:00:00Z'),
        endDateTime: new Date('2024-06-15T15:00:00Z'),
      };

      expect(hasSchedulingConflict(event1, event2)).toBe(false);
    });

    it('should not detect conflicts for unscheduled events', () => {
      const event1 = mockUnscheduledEvent;
      const event2 = { ...mockUnscheduledEvent, id: 'event-2' };

      expect(hasSchedulingConflict(event1, event2)).toBe(false);
    });
  });

  describe('getEventDateRange', () => {
    it('should return "Unscheduled" for unscheduled events', () => {
      expect(getEventDateRange(mockUnscheduledEvent)).toBe('Unscheduled');
    });

    it('should format timed event date range', () => {
      const timedEvent: TimedEvent = {
        ...mockUnscheduledEvent,
        kind: 'timed',
        startDateTime: new Date('2024-06-15T09:00:00Z'),
        endDateTime: new Date('2024-06-15T17:00:00Z'),
      };

      const result = getEventDateRange(timedEvent);
      expect(result).toContain('2024-06-15'); // Date in result
      expect(result).toMatch(/[0-9]+:[0-9]+:[0-9]+/); // Time pattern in result
    });
  });
});