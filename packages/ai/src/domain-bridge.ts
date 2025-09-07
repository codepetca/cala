/**
 * AI Domain Bridge
 * 
 * Type-safe wrapper around domain functions for AI consumption.
 * Provides validation, error handling, and data transformation between
 * AI formats and domain types.
 */

import {
  TripEvent,
  TripEventRefinedSchema,
  UnscheduledEvent,
  AllDayEvent,
  TimedEvent,
  EventKind,
} from '@trip-planner/domain/src/schemas/trip-event';

import {
  scheduleAsAllDay,
  scheduleAsTimed,
  unscheduleEvent,
  convertToAllDay,
  convertToTimed,
  hasSchedulingConflict,
  getEventDateRange,
} from '@trip-planner/domain/src/functions/event-scheduling';

import { Trip, TripSchema } from '@trip-planner/domain/src/schemas/trip';
import { User, UserSchema } from '@trip-planner/domain/src/schemas/user';
import { Workspace, WorkspaceSchema } from '@trip-planner/domain/src/schemas/workspace';

// AI-friendly error types
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
export class AIEventOperations {
  
  /**
   * Validate event data against schema
   */
  static validateEvent(eventData: unknown): AIResult<TripEvent> {
    try {
      const event = TripEventRefinedSchema.parse(eventData);
      return { success: true, data: event };
    } catch (error) {
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
  static scheduleAsAllDay(
    event: UnscheduledEvent,
    startDate: string | Date,
    endDate?: string | Date
  ): AIResult<AllDayEvent> {
    try {
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : undefined;
      
      const scheduledEvent = scheduleAsAllDay(event, start, end);
      return { success: true, data: scheduledEvent };
    } catch (error) {
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
  static scheduleAsTimed(
    event: UnscheduledEvent,
    startDateTime: string | Date,
    endDateTime: string | Date
  ): AIResult<TimedEvent> {
    try {
      const start = typeof startDateTime === 'string' ? new Date(startDateTime) : startDateTime;
      const end = typeof endDateTime === 'string' ? new Date(endDateTime) : endDateTime;
      
      const scheduledEvent = scheduleAsTimed(event, start, end);
      return { success: true, data: scheduledEvent };
    } catch (error) {
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
  static convertEvent(
    event: TripEvent,
    targetKind: EventKind,
    scheduleData?: {
      startDate?: string | Date;
      endDate?: string | Date;
      startDateTime?: string | Date;
      endDateTime?: string | Date;
    }
  ): AIResult<TripEvent> {
    try {
      switch (targetKind) {
        case 'unscheduled':
          if (event.kind === 'unscheduled') {
            return { success: true, data: event };
          }
          const unscheduled = unscheduleEvent(event as AllDayEvent | TimedEvent);
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
            const allDay = convertToAllDay(event as TimedEvent, startDate, endDate);
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
          return this.scheduleAsAllDay(
            event as UnscheduledEvent,
            scheduleData.startDate,
            scheduleData.endDate
          );

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
            const timed = convertToTimed(event as AllDayEvent, startDateTime, endDateTime);
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
          return this.scheduleAsTimed(
            event as UnscheduledEvent,
            scheduleData.startDateTime,
            scheduleData.endDateTime
          );

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
    } catch (error) {
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
  static checkConflict(event1: TripEvent, event2: TripEvent): AIResult<boolean> {
    try {
      const hasConflict = hasSchedulingConflict(event1, event2);
      return { success: true, data: hasConflict };
    } catch (error) {
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
  static getDateRange(event: TripEvent): AIResult<string> {
    try {
      const dateRange = getEventDateRange(event);
      return { success: true, data: dateRange };
    } catch (error) {
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
  static createUnscheduledEvent(eventData: {
    id: string;
    tripId: string;
    title: string;
    notes?: string;
  }): AIResult<UnscheduledEvent> {
    try {
      const now = new Date();
      const event: UnscheduledEvent = {
        ...eventData,
        kind: 'unscheduled',
        createdAt: now,
        updatedAt: now,
      };
      
      const validated = TripEventRefinedSchema.parse(event) as UnscheduledEvent;
      return { success: true, data: validated };
    } catch (error) {
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

/**
 * AI Schema Utilities
 * 
 * Helpers for working with generated JSON schemas and validation.
 */
export class AISchemaUtils {
  
  /**
   * Validate any data against Trip schema
   */
  static validateTrip(tripData: unknown): AIResult<Trip> {
    try {
      const trip = TripSchema.parse(tripData);
      return { success: true, data: trip };
    } catch (error) {
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
  static validateUser(userData: unknown): AIResult<User> {
    try {
      const user = UserSchema.parse(userData);
      return { success: true, data: user };
    } catch (error) {
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
  static validateWorkspace(workspaceData: unknown): AIResult<Workspace> {
    try {
      const workspace = WorkspaceSchema.parse(workspaceData);
      return { success: true, data: workspace };
    } catch (error) {
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
  static getEventKind(eventData: unknown): EventKind | null {
    try {
      const event = TripEventRefinedSchema.parse(eventData);
      return event.kind;
    } catch {
      return null;
    }
  }
}