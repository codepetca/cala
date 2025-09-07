/**
 * Trip Event Domain Schema
 * 
 * Models VEVENT-like events including events with no start date.
 * Uses discriminated union for explicit rules that AI agents can reason about.
 */

import { z } from 'zod';

// Base event properties shared across all event types
const BaseEventSchema = z.object({
  id: z.string().describe('Unique identifier for the event'),
  tripId: z.string().describe('ID of the trip this event belongs to'),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less')
    .describe('Event title/summary'),
  notes: z.string()
    .max(2000, 'Notes must be 2000 characters or less')
    .optional()
    .describe('Optional detailed notes about the event'),
  createdAt: z.date().describe('When this event was created'),
  updatedAt: z.date().describe('When this event was last updated'),
});

// Unscheduled event - exists in backlog without any time constraints
const UnscheduledEventSchema = BaseEventSchema.extend({
  kind: z.literal('unscheduled').describe('Event has no scheduled time'),
});

// All-day event - scheduled for entire day(s) without specific times
const AllDayEventSchema = BaseEventSchema.extend({
  kind: z.literal('allDay').describe('Event scheduled for full day(s)'),
  startDate: z.date().describe('First day of the event (YYYY-MM-DD)'),
  endDate: z.date()
    .optional()
    .describe('Last day of the event (YYYY-MM-DD), defaults to startDate'),
});

// Timed event - scheduled with specific start and end times
const TimedEventSchema = BaseEventSchema.extend({
  kind: z.literal('timed').describe('Event with specific start/end times'),
  startDateTime: z.date().describe('Event start date and time (ISO 8601)'),
  endDateTime: z.date().describe('Event end date and time (ISO 8601)'),
});

// Discriminated union of all event types
export const TripEventSchema = z.discriminatedUnion('kind', [
  UnscheduledEventSchema,
  AllDayEventSchema,
  TimedEventSchema,
]).describe('A trip event that can be unscheduled, all-day, or timed');

// Type exports
export type TripEvent = z.infer<typeof TripEventSchema>;
export type UnscheduledEvent = z.infer<typeof UnscheduledEventSchema>;
export type AllDayEvent = z.infer<typeof AllDayEventSchema>;
export type TimedEvent = z.infer<typeof TimedEventSchema>;

// Event kind type for filtering
export type EventKind = TripEvent['kind'];

// Export individual schemas for AI generation
export { UnscheduledEventSchema, AllDayEventSchema, TimedEventSchema };

// Schema refinements for business rules
export const TripEventRefinedSchema = TripEventSchema
  .refine((event) => {
    if (event.kind === 'allDay' && event.endDate) {
      return event.endDate >= event.startDate;
    }
    return true;
  }, 'End date must be after or equal to start date')
  .refine((event) => {
    if (event.kind === 'timed') {
      return event.endDateTime > event.startDateTime;
    }
    return true;
  }, 'End time must be after start time');

export type TripEventRefined = z.infer<typeof TripEventRefinedSchema>;