import { z } from 'zod';

/**
 * Event type enumeration with user-friendly labels
 */
export const EventTypeEnum = z.enum(['stay', 'activity', 'meal', 'transport', 'note']);

/**
 * Event schema with comprehensive validation
 */
export const EventSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
  tripId: z.string().min(1, 'Trip ID is required'),
  familyId: z.string().optional().describe('Family ID - null/undefined means shared event'),
  title: z.string().min(1, 'Event title is required').max(100, 'Title must be under 100 characters'),
  type: EventTypeEnum,
  start: z.date().optional().describe('Start date/time - optional for unscheduled events'),
  end: z.date().optional().describe('End date/time - optional'),
  parentId: z.string().optional().describe('Parent event ID for nested events'),
  details: z.string().optional(),
  order: z.number().int().min(0).default(0).describe('Display order for drag & drop'),
});

/**
 * Family schema with color validation
 */
export const FamilySchema = z.object({
  id: z.string().min(1, 'Family ID is required'),
  name: z.string().min(1, 'Family name is required').max(50, 'Name must be under 50 characters'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .default('#3b82f6')
    .describe('Hex color code for family identification'),
});

/**
 * Trip schema with date validation
 */
export const TripSchema = z.object({
  id: z.string().min(1, 'Trip ID is required'),
  name: z.string().min(1, 'Trip name is required').max(100, 'Name must be under 100 characters'),
  startDate: z.date(),
  endDate: z.date(),
  families: z.array(FamilySchema).default([]),
  events: z.array(EventSchema).default([]),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

/**
 * TypeScript types derived from Zod schemas
 */
export type Event = z.infer<typeof EventSchema>;
export type Family = z.infer<typeof FamilySchema>;
export type Trip = z.infer<typeof TripSchema>;
export type EventType = z.infer<typeof EventTypeEnum>;

/**
 * Event type labels for UI display
 */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  stay: 'Stay 🏨',
  activity: 'Activity 🎯',
  meal: 'Meal 🍽️',
  transport: 'Transport 🚗',
  note: 'Note 📝',
} as const;

/**
 * Validation helper for parsing unknown data safely
 */
export function parseTrip(data: unknown): Trip {
  return TripSchema.parse(data);
}

export function parseEvent(data: unknown): Event {
  return EventSchema.parse(data);
}

export function parseFamily(data: unknown): Family {
  return FamilySchema.parse(data);
}

/**
 * Safe parsing with error handling
 */
export function safeParseTripArray(data: unknown): { success: true; data: Trip[] } | { success: false; error: z.ZodError } {
  return z.array(TripSchema).safeParse(data);
}