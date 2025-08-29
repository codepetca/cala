/**
 * Centralized exports for all schemas
 */

// Trip-related schemas
export {
  EventSchema,
  FamilySchema,
  TripSchema,
  EventTypeEnum,
  EVENT_TYPE_LABELS,
  parseTrip,
  parseEvent,
  parseFamily,
  safeParseTripArray,
  type Event,
  type Family,
  type Trip,
  type EventType,
} from './trip.schema';

// Common schemas and utilities
export {
  generateId,
  IdSchema,
  DateRangeSchema,
  ColorSchema,
  VALIDATION_MESSAGES,
} from './common.schema';