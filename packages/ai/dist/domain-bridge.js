"use strict";
/**
 * AI Domain Bridge
 *
 * Type-safe wrapper around domain functions for AI consumption.
 * Provides validation, error handling, and data transformation between
 * AI formats and domain types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISchemaUtils = exports.AIEventOperations = void 0;
const trip_event_1 = require("@trip-planner/domain/src/schemas/trip-event");
const event_scheduling_1 = require("@trip-planner/domain/src/functions/event-scheduling");
const trip_1 = require("@trip-planner/domain/src/schemas/trip");
const user_1 = require("@trip-planner/domain/src/schemas/user");
const workspace_1 = require("@trip-planner/domain/src/schemas/workspace");
/**
 * AI Event Operations
 *
 * Type-safe wrappers around event domain functions with AI-friendly
 * error handling and validation.
 */
class AIEventOperations {
    /**
     * Validate event data against schema
     */
    static validateEvent(eventData) {
        try {
            const event = trip_event_1.TripEventRefinedSchema.parse(eventData);
            return { success: true, data: event };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'validation',
                    message: error instanceof Error ? error.message : 'Invalid event data',
                },
            };
        }
    }
    /**
     * Schedule an unscheduled event as all-day
     */
    static scheduleAsAllDay(event, startDate, endDate) {
        try {
            const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
            const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : undefined;
            const scheduledEvent = (0, event_scheduling_1.scheduleAsAllDay)(event, start, end);
            return { success: true, data: scheduledEvent };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'business_logic',
                    message: error instanceof Error ? error.message : 'Failed to schedule event',
                },
            };
        }
    }
    /**
     * Schedule an unscheduled event as timed
     */
    static scheduleAsTimed(event, startDateTime, endDateTime) {
        try {
            const start = typeof startDateTime === 'string' ? new Date(startDateTime) : startDateTime;
            const end = typeof endDateTime === 'string' ? new Date(endDateTime) : endDateTime;
            const scheduledEvent = (0, event_scheduling_1.scheduleAsTimed)(event, start, end);
            return { success: true, data: scheduledEvent };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'business_logic',
                    message: error instanceof Error ? error.message : 'Failed to schedule event',
                },
            };
        }
    }
    /**
     * Convert event between scheduling types
     */
    static convertEvent(event, targetKind, scheduleData) {
        try {
            switch (targetKind) {
                case 'unscheduled':
                    if (event.kind === 'unscheduled') {
                        return { success: true, data: event };
                    }
                    const unscheduled = (0, event_scheduling_1.unscheduleEvent)(event);
                    return { success: true, data: unscheduled };
                case 'allDay':
                    if (event.kind === 'allDay') {
                        return { success: true, data: event };
                    }
                    if (event.kind === 'timed') {
                        const startDate = scheduleData?.startDate
                            ? (typeof scheduleData.startDate === 'string' ? new Date(scheduleData.startDate) : scheduleData.startDate)
                            : undefined;
                        const endDate = scheduleData?.endDate
                            ? (typeof scheduleData.endDate === 'string' ? new Date(scheduleData.endDate) : scheduleData.endDate)
                            : undefined;
                        const allDay = (0, event_scheduling_1.convertToAllDay)(event, startDate, endDate);
                        return { success: true, data: allDay };
                    }
                    // For unscheduled -> allDay, need schedule data
                    if (!scheduleData?.startDate) {
                        return {
                            success: false,
                            error: {
                                type: 'validation',
                                message: 'Start date required to convert unscheduled event to all-day',
                                field: 'startDate',
                            },
                        };
                    }
                    return this.scheduleAsAllDay(event, scheduleData.startDate, scheduleData.endDate);
                case 'timed':
                    if (event.kind === 'timed') {
                        return { success: true, data: event };
                    }
                    if (event.kind === 'allDay') {
                        if (!scheduleData?.startDateTime || !scheduleData?.endDateTime) {
                            return {
                                success: false,
                                error: {
                                    type: 'validation',
                                    message: 'Start and end date-times required to convert all-day event to timed',
                                    field: 'startDateTime',
                                },
                            };
                        }
                        const startDateTime = typeof scheduleData.startDateTime === 'string'
                            ? new Date(scheduleData.startDateTime)
                            : scheduleData.startDateTime;
                        const endDateTime = typeof scheduleData.endDateTime === 'string'
                            ? new Date(scheduleData.endDateTime)
                            : scheduleData.endDateTime;
                        const timed = (0, event_scheduling_1.convertToTimed)(event, startDateTime, endDateTime);
                        return { success: true, data: timed };
                    }
                    // For unscheduled -> timed, need schedule data
                    if (!scheduleData?.startDateTime || !scheduleData?.endDateTime) {
                        return {
                            success: false,
                            error: {
                                type: 'validation',
                                message: 'Start and end date-times required to convert unscheduled event to timed',
                                field: 'startDateTime',
                            },
                        };
                    }
                    return this.scheduleAsTimed(event, scheduleData.startDateTime, scheduleData.endDateTime);
                default:
                    return {
                        success: false,
                        error: {
                            type: 'validation',
                            message: `Invalid target event kind: ${targetKind}`,
                            field: 'targetKind',
                        },
                    };
            }
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'business_logic',
                    message: error instanceof Error ? error.message : 'Failed to convert event',
                },
            };
        }
    }
    /**
     * Check for scheduling conflicts between events
     */
    static checkConflict(event1, event2) {
        try {
            const hasConflict = (0, event_scheduling_1.hasSchedulingConflict)(event1, event2);
            return { success: true, data: hasConflict };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'business_logic',
                    message: error instanceof Error ? error.message : 'Failed to check conflict',
                },
            };
        }
    }
    /**
     * Get human-readable date range for event
     */
    static getDateRange(event) {
        try {
            const dateRange = (0, event_scheduling_1.getEventDateRange)(event);
            return { success: true, data: dateRange };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'business_logic',
                    message: error instanceof Error ? error.message : 'Failed to get date range',
                },
            };
        }
    }
    /**
     * Create a new unscheduled event with AI-friendly validation
     */
    static createUnscheduledEvent(eventData) {
        try {
            const now = new Date();
            const event = {
                ...eventData,
                kind: 'unscheduled',
                createdAt: now,
                updatedAt: now,
            };
            const validated = trip_event_1.TripEventRefinedSchema.parse(event);
            return { success: true, data: validated };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'validation',
                    message: error instanceof Error ? error.message : 'Invalid event data',
                },
            };
        }
    }
}
exports.AIEventOperations = AIEventOperations;
/**
 * AI Schema Utilities
 *
 * Helpers for working with generated JSON schemas and validation.
 */
class AISchemaUtils {
    /**
     * Validate any data against Trip schema
     */
    static validateTrip(tripData) {
        try {
            const trip = trip_1.TripSchema.parse(tripData);
            return { success: true, data: trip };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'validation',
                    message: error instanceof Error ? error.message : 'Invalid trip data',
                },
            };
        }
    }
    /**
     * Validate any data against User schema
     */
    static validateUser(userData) {
        try {
            const user = user_1.UserSchema.parse(userData);
            return { success: true, data: user };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'validation',
                    message: error instanceof Error ? error.message : 'Invalid user data',
                },
            };
        }
    }
    /**
     * Validate any data against Workspace schema
     */
    static validateWorkspace(workspaceData) {
        try {
            const workspace = workspace_1.WorkspaceSchema.parse(workspaceData);
            return { success: true, data: workspace };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'validation',
                    message: error instanceof Error ? error.message : 'Invalid workspace data',
                },
            };
        }
    }
    /**
     * Get event kind from event data
     */
    static getEventKind(eventData) {
        try {
            const event = trip_event_1.TripEventRefinedSchema.parse(eventData);
            return event.kind;
        }
        catch {
            return null;
        }
    }
}
exports.AISchemaUtils = AISchemaUtils;
//# sourceMappingURL=domain-bridge.js.map