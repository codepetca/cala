import { z } from "zod";

export const EventSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  familyId: z.string().optional(), // null = shared
  title: z.string(),
  type: z.enum(["stay", "activity", "meal", "transport", "note"]),
  start: z.date().optional(),
  end: z.date().optional(),
  parentId: z.string().optional(), // for nested cards
  details: z.string().optional(),
  order: z.number().default(0), // for drag & drop ordering
});

export const FamilySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().default("#3b82f6"), // blue by default
});

export const TripSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  families: z.array(FamilySchema),
  events: z.array(EventSchema),
});

// TypeScript types derived from Zod schemas
export type Event = z.infer<typeof EventSchema>;
export type Family = z.infer<typeof FamilySchema>;
export type Trip = z.infer<typeof TripSchema>;

// Helper function to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Helper function to get days between start and end date
export function getTripDays(trip: Trip): Date[] {
  const days: Date[] = [];
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  
  return days;
}

// Helper function to format date for display
export function formatDate(date: Date): string {
  const formatted = date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  // Remove comma and return
  return formatted.replace(',', '');
}