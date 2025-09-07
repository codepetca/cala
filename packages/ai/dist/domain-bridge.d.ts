/**
 * AI Domain Bridge
 *
 * Type-safe wrapper around domain functions for AI consumption.
 * Provides validation, error handling, and data transformation between
 * AI formats and domain types.
 */
import { TripEvent, UnscheduledEvent, AllDayEvent, TimedEvent, EventKind } from '@trip-planner/domain/src/schemas/trip-event';
import { Trip } from '@trip-planner/domain/src/schemas/trip';
import { User } from '@trip-planner/domain/src/schemas/user';
import { Workspace } from '@trip-planner/domain/src/schemas/workspace';
export interface AIError {
    type: 'validation' | 'business_logic' | 'not_found' | 'permission';
    message: string;
    field?: string;
    code?: string;
}
export interface AIResult<T> {
    success: boolean;
    data?: T;
    error?: AIError;
}
/**
 * AI Event Operations
 *
 * Type-safe wrappers around event domain functions with AI-friendly
 * error handling and validation.
 */
export declare class AIEventOperations {
    /**
     * Validate event data against schema
     */
    static validateEvent(eventData: unknown): AIResult<TripEvent>;
    /**
     * Schedule an unscheduled event as all-day
     */
    static scheduleAsAllDay(event: UnscheduledEvent, startDate: string | Date, endDate?: string | Date): AIResult<AllDayEvent>;
    /**
     * Schedule an unscheduled event as timed
     */
    static scheduleAsTimed(event: UnscheduledEvent, startDateTime: string | Date, endDateTime: string | Date): AIResult<TimedEvent>;
    /**
     * Convert event between scheduling types
     */
    static convertEvent(event: TripEvent, targetKind: EventKind, scheduleData?: {
        startDate?: string | Date;
        endDate?: string | Date;
        startDateTime?: string | Date;
        endDateTime?: string | Date;
    }): AIResult<TripEvent>;
    /**
     * Check for scheduling conflicts between events
     */
    static checkConflict(event1: TripEvent, event2: TripEvent): AIResult<boolean>;
    /**
     * Get human-readable date range for event
     */
    static getDateRange(event: TripEvent): AIResult<string>;
    /**
     * Create a new unscheduled event with AI-friendly validation
     */
    static createUnscheduledEvent(eventData: {
        id: string;
        tripId: string;
        title: string;
        notes?: string;
    }): AIResult<UnscheduledEvent>;
}
/**
 * AI Schema Utilities
 *
 * Helpers for working with generated JSON schemas and validation.
 */
export declare class AISchemaUtils {
    /**
     * Validate any data against Trip schema
     */
    static validateTrip(tripData: unknown): AIResult<Trip>;
    /**
     * Validate any data against User schema
     */
    static validateUser(userData: unknown): AIResult<User>;
    /**
     * Validate any data against Workspace schema
     */
    static validateWorkspace(workspaceData: unknown): AIResult<Workspace>;
    /**
     * Get event kind from event data
     */
    static getEventKind(eventData: unknown): EventKind | null;
}
//# sourceMappingURL=domain-bridge.d.ts.map