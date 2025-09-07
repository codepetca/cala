"use strict";
/**
 * Event Scheduling Domain Functions
 *
 * Pure functions for managing event state transitions between
 * unscheduled, all-day, and timed states.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleAsAllDay = scheduleAsAllDay;
exports.scheduleAsTimed = scheduleAsTimed;
exports.convertToTimed = convertToTimed;
exports.convertToAllDay = convertToAllDay;
exports.unscheduleEvent = unscheduleEvent;
exports.hasSchedulingConflict = hasSchedulingConflict;
exports.getEventDateRange = getEventDateRange;
const trip_event_1 = require("../schemas/trip-event");
/**
 * Schedule an unscheduled event as an all-day event.
 *
 * @param event - The unscheduled event to schedule
 * @param startDate - The date for the all-day event
 * @param endDate - Optional end date (defaults to startDate)
 * @returns Scheduled all-day event
 */
function scheduleAsAllDay(event, startDate, endDate) {
    const scheduledEvent = {
        ...event,
        kind: 'allDay',
        startDate,
        endDate: endDate || startDate,
        updatedAt: new Date(),
    };
    // Validate the result
    return trip_event_1.TripEventRefinedSchema.parse(scheduledEvent);
}
/**
 * Schedule an unscheduled event as a timed event.
 *
 * @param event - The unscheduled event to schedule
 * @param startDateTime - The start date and time
 * @param endDateTime - The end date and time
 * @returns Scheduled timed event
 */
function scheduleAsTimed(event, startDateTime, endDateTime) {
    const scheduledEvent = {
        ...event,
        kind: 'timed',
        startDateTime,
        endDateTime,
        updatedAt: new Date(),
    };
    // Validate the result
    return trip_event_1.TripEventRefinedSchema.parse(scheduledEvent);
}
/**
 * Convert an all-day event to a timed event.
 *
 * @param event - The all-day event to convert
 * @param startDateTime - The start date and time
 * @param endDateTime - The end date and time
 * @returns Timed event
 */
function convertToTimed(event, startDateTime, endDateTime) {
    const timedEvent = {
        ...event,
        kind: 'timed',
        startDateTime,
        endDateTime,
        updatedAt: new Date(),
    };
    // Validate the result
    return trip_event_1.TripEventRefinedSchema.parse(timedEvent);
}
/**
 * Convert a timed event to an all-day event.
 *
 * @param event - The timed event to convert
 * @param startDate - Optional start date (defaults to date from startDateTime)
 * @param endDate - Optional end date (defaults to startDate)
 * @returns All-day event
 */
function convertToAllDay(event, startDate, endDate) {
    const defaultStartDate = startDate || new Date(event.startDateTime.toDateString());
    const allDayEvent = {
        ...event,
        kind: 'allDay',
        startDate: defaultStartDate,
        endDate: endDate || defaultStartDate,
        updatedAt: new Date(),
    };
    // Validate the result
    return trip_event_1.TripEventRefinedSchema.parse(allDayEvent);
}
/**
 * Unschedule any scheduled event back to unscheduled state.
 *
 * @param event - The scheduled event to unschedule
 * @returns Unscheduled event
 */
function unscheduleEvent(event) {
    const unscheduledEvent = {
        id: event.id,
        tripId: event.tripId,
        title: event.title,
        notes: event.notes,
        createdAt: event.createdAt,
        updatedAt: new Date(),
        kind: 'unscheduled',
    };
    // Validate the result
    return trip_event_1.TripEventRefinedSchema.parse(unscheduledEvent);
}
/**
 * Check if an event has scheduling conflicts with another event.
 * Only checks timed events for actual time conflicts.
 *
 * @param event1 - First event to check
 * @param event2 - Second event to check
 * @returns True if there's a scheduling conflict
 */
function hasSchedulingConflict(event1, event2) {
    // Only timed events can have actual conflicts
    if (event1.kind !== 'timed' || event2.kind !== 'timed') {
        return false;
    }
    // Check if time ranges overlap
    return (event1.startDateTime < event2.endDateTime &&
        event2.startDateTime < event1.endDateTime);
}
/**
 * Get the display date range for any event type.
 *
 * @param event - The event to get date range for
 * @returns Human-readable date range string
 */
function getEventDateRange(event) {
    switch (event.kind) {
        case 'unscheduled':
            return 'Unscheduled';
        case 'allDay':
            if (!event.endDate || event.startDate.getTime() === event.endDate.getTime()) {
                return event.startDate.toLocaleDateString();
            }
            return `${event.startDate.toLocaleDateString()} - ${event.endDate.toLocaleDateString()}`;
        case 'timed':
            const startDate = event.startDateTime.toLocaleDateString();
            const endDate = event.endDateTime.toLocaleDateString();
            const startTime = event.startDateTime.toLocaleTimeString();
            const endTime = event.endDateTime.toLocaleTimeString();
            if (startDate === endDate) {
                return `${startDate}, ${startTime} - ${endTime}`;
            }
            return `${startDate} ${startTime} - ${endDate} ${endTime}`;
        default:
            return 'Unknown';
    }
}
