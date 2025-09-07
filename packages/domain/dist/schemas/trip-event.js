"use strict";
/**
 * Trip Event Domain Schema
 *
 * Models VEVENT-like events including events with no start date.
 * Uses discriminated union for explicit rules that AI agents can reason about.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripEventRefinedSchema = exports.TimedEventSchema = exports.AllDayEventSchema = exports.UnscheduledEventSchema = exports.TripEventSchema = void 0;
const zod_1 = require("zod");
// Base event properties shared across all event types
const BaseEventSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique identifier for the event'),
    tripId: zod_1.z.string().describe('ID of the trip this event belongs to'),
    title: zod_1.z.string()
        .min(1, 'Title is required')
        .max(100, 'Title must be 100 characters or less')
        .describe('Event title/summary'),
    notes: zod_1.z.string()
        .max(2000, 'Notes must be 2000 characters or less')
        .optional()
        .describe('Optional detailed notes about the event'),
    createdAt: zod_1.z.date().describe('When this event was created'),
    updatedAt: zod_1.z.date().describe('When this event was last updated'),
});
// Unscheduled event - exists in backlog without any time constraints
const UnscheduledEventSchema = BaseEventSchema.extend({
    kind: zod_1.z.literal('unscheduled').describe('Event has no scheduled time'),
});
exports.UnscheduledEventSchema = UnscheduledEventSchema;
// All-day event - scheduled for entire day(s) without specific times
const AllDayEventSchema = BaseEventSchema.extend({
    kind: zod_1.z.literal('allDay').describe('Event scheduled for full day(s)'),
    startDate: zod_1.z.date().describe('First day of the event (YYYY-MM-DD)'),
    endDate: zod_1.z.date()
        .optional()
        .describe('Last day of the event (YYYY-MM-DD), defaults to startDate'),
});
exports.AllDayEventSchema = AllDayEventSchema;
// Timed event - scheduled with specific start and end times
const TimedEventSchema = BaseEventSchema.extend({
    kind: zod_1.z.literal('timed').describe('Event with specific start/end times'),
    startDateTime: zod_1.z.date().describe('Event start date and time (ISO 8601)'),
    endDateTime: zod_1.z.date().describe('Event end date and time (ISO 8601)'),
});
exports.TimedEventSchema = TimedEventSchema;
// Discriminated union of all event types
exports.TripEventSchema = zod_1.z.discriminatedUnion('kind', [
    UnscheduledEventSchema,
    AllDayEventSchema,
    TimedEventSchema,
]).describe('A trip event that can be unscheduled, all-day, or timed');
// Schema refinements for business rules
exports.TripEventRefinedSchema = exports.TripEventSchema
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
