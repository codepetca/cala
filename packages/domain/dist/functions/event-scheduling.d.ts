/**
 * Event Scheduling Domain Functions
 *
 * Pure functions for managing event state transitions between
 * unscheduled, all-day, and timed states.
 */
import { TripEvent, UnscheduledEvent, AllDayEvent, TimedEvent } from '../schemas/trip-event';
/**
 * Schedule an unscheduled event as an all-day event.
 *
 * @param event - The unscheduled event to schedule
 * @param startDate - The date for the all-day event
 * @param endDate - Optional end date (defaults to startDate)
 * @returns Scheduled all-day event
 */
export declare function scheduleAsAllDay(event: UnscheduledEvent, startDate: Date, endDate?: Date): AllDayEvent;
/**
 * Schedule an unscheduled event as a timed event.
 *
 * @param event - The unscheduled event to schedule
 * @param startDateTime - The start date and time
 * @param endDateTime - The end date and time
 * @returns Scheduled timed event
 */
export declare function scheduleAsTimed(event: UnscheduledEvent, startDateTime: Date, endDateTime: Date): TimedEvent;
/**
 * Convert an all-day event to a timed event.
 *
 * @param event - The all-day event to convert
 * @param startDateTime - The start date and time
 * @param endDateTime - The end date and time
 * @returns Timed event
 */
export declare function convertToTimed(event: AllDayEvent, startDateTime: Date, endDateTime: Date): TimedEvent;
/**
 * Convert a timed event to an all-day event.
 *
 * @param event - The timed event to convert
 * @param startDate - Optional start date (defaults to date from startDateTime)
 * @param endDate - Optional end date (defaults to startDate)
 * @returns All-day event
 */
export declare function convertToAllDay(event: TimedEvent, startDate?: Date, endDate?: Date): AllDayEvent;
/**
 * Unschedule any scheduled event back to unscheduled state.
 *
 * @param event - The scheduled event to unschedule
 * @returns Unscheduled event
 */
export declare function unscheduleEvent(event: AllDayEvent | TimedEvent): UnscheduledEvent;
/**
 * Check if an event has scheduling conflicts with another event.
 * Only checks timed events for actual time conflicts.
 *
 * @param event1 - First event to check
 * @param event2 - Second event to check
 * @returns True if there's a scheduling conflict
 */
export declare function hasSchedulingConflict(event1: TripEvent, event2: TripEvent): boolean;
/**
 * Get the display date range for any event type.
 *
 * @param event - The event to get date range for
 * @returns Human-readable date range string
 */
export declare function getEventDateRange(event: TripEvent): string;
