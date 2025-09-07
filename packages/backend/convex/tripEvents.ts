import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireWorkspaceMembership } from './workspaces';

// Simple validation functions for trip events
function validateEventInput(args: any) {
  if (!args.title || args.title.length === 0 || args.title.length > 100) {
    throw new Error('Event title must be between 1 and 100 characters');
  }
  if (args.notes && args.notes.length > 500) {
    throw new Error('Event notes must be 500 characters or less');
  }
  if (!args.kind || !['unscheduled', 'allDay', 'timed'].includes(args.kind)) {
    throw new Error('Event kind must be unscheduled, allDay, or timed');
  }
}

function validateSchedulingInput(args: any) {
  if (args.kind === 'allDay') {
    if (!args.startDate) {
      throw new Error('All-day events require a start date');
    }
    if (args.endDate && args.endDate < args.startDate) {
      throw new Error('End date must be after or equal to start date');
    }
  } else if (args.kind === 'timed') {
    if (!args.startDateTime || !args.endDateTime) {
      throw new Error('Timed events require start and end date-times');
    }
    if (args.endDateTime <= args.startDateTime) {
      throw new Error('End time must be after start time');
    }
  }
}

async function validateEventPermissions(ctx: any, tripId: string, requiredRole: 'viewer' | 'editor' | 'owner' = 'editor') {
  const trip = await ctx.db.get(tripId);
  if (!trip) throw new Error('Trip not found');
  
  await requireWorkspaceMembership(ctx, trip.workspaceId, requiredRole);
  return trip;
}

export const createTripEvent = mutation({
  args: {
    tripId: v.id('trips'),
    title: v.string(),
    notes: v.optional(v.string()),
    kind: v.union(v.literal('unscheduled'), v.literal('allDay'), v.literal('timed')),
    // All-day event fields
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    // Timed event fields
    startDateTime: v.optional(v.number()),
    endDateTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    validateEventInput(args);
    validateSchedulingInput(args);
    
    try {
      await validateEventPermissions(ctx, args.tripId);
    } catch (error) {
      throw new Error(`Permission error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    const now = Date.now();
    const eventId = await ctx.db.insert('tripEvents', {
      tripId: args.tripId,
      title: args.title,
      notes: args.notes,
      kind: args.kind,
      startDate: args.startDate,
      endDate: args.endDate,
      startDateTime: args.startDateTime,
      endDateTime: args.endDateTime,
      createdAt: now,
      updatedAt: now,
    });

    return eventId;
  },
});

export const updateTripEvent = mutation({
  args: {
    eventId: v.id('tripEvents'),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    kind: v.optional(v.union(v.literal('unscheduled'), v.literal('allDay'), v.literal('timed'))),
    // All-day event fields
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    // Timed event fields
    startDateTime: v.optional(v.number()),
    endDateTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error('Event not found');
    
    await validateEventPermissions(ctx, event.tripId);

    const updates: any = { updatedAt: Date.now() };
    
    // Build the updated event for validation
    const updatedEvent = { ...event };
    if (args.title !== undefined) updatedEvent.title = args.title;
    if (args.notes !== undefined) updatedEvent.notes = args.notes;
    if (args.kind !== undefined) updatedEvent.kind = args.kind;
    if (args.startDate !== undefined) updatedEvent.startDate = args.startDate;
    if (args.endDate !== undefined) updatedEvent.endDate = args.endDate;
    if (args.startDateTime !== undefined) updatedEvent.startDateTime = args.startDateTime;
    if (args.endDateTime !== undefined) updatedEvent.endDateTime = args.endDateTime;
    
    validateEventInput(updatedEvent);
    validateSchedulingInput(updatedEvent);

    // Apply updates
    if (args.title !== undefined) updates.title = args.title;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.kind !== undefined) updates.kind = args.kind;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.startDateTime !== undefined) updates.startDateTime = args.startDateTime;
    if (args.endDateTime !== undefined) updates.endDateTime = args.endDateTime;

    await ctx.db.patch(args.eventId, updates);
    return true;
  },
});

export const deleteTripEvent = mutation({
  args: { eventId: v.id('tripEvents') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error('Event not found');
    
    await validateEventPermissions(ctx, event.tripId);
    
    await ctx.db.delete(args.eventId);
    return true;
  },
});

export const getTripEvents = query({
  args: { tripId: v.id('trips') },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return [];

    try {
      await requireWorkspaceMembership(ctx, trip.workspaceId);
    } catch {
      if (!trip.isPublic) return [];
    }

    return ctx.db
      .query('tripEvents')
      .withIndex('by_trip', (q) => q.eq('tripId', args.tripId))
      .order('desc')
      .collect();
  },
});

export const getTripEventsPublic = query({
  args: { shareSlug: v.string() },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query('trips')
      .withIndex('by_shareSlug', (q) => q.eq('shareSlug', args.shareSlug))
      .first();
      
    if (!trip || !trip.isPublic) return [];

    return ctx.db
      .query('tripEvents')
      .withIndex('by_trip', (q) => q.eq('tripId', trip._id))
      .order('desc')
      .collect();
  },
});

// Get events by scheduling type
export const getTripEventsByKind = query({
  args: { 
    tripId: v.id('trips'),
    kind: v.union(v.literal('unscheduled'), v.literal('allDay'), v.literal('timed'))
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return [];

    try {
      await requireWorkspaceMembership(ctx, trip.workspaceId);
    } catch {
      if (!trip.isPublic) return [];
    }

    return ctx.db
      .query('tripEvents')
      .withIndex('by_kind', (q) => q.eq('tripId', args.tripId).eq('kind', args.kind))
      .collect();
  },
});

// Convenience functions for scheduling state transitions
export const scheduleEventAsAllDay = mutation({
  args: {
    eventId: v.id('tripEvents'),
    startDate: v.number(),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error('Event not found');
    
    await validateEventPermissions(ctx, event.tripId);

    const endDate = args.endDate || args.startDate;
    if (endDate < args.startDate) {
      throw new Error('End date must be after or equal to start date');
    }

    await ctx.db.patch(args.eventId, {
      kind: 'allDay',
      startDate: args.startDate,
      endDate,
      startDateTime: undefined,
      endDateTime: undefined,
      updatedAt: Date.now(),
    });
    
    return true;
  },
});

export const scheduleEventAsTimed = mutation({
  args: {
    eventId: v.id('tripEvents'),
    startDateTime: v.number(),
    endDateTime: v.number(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error('Event not found');
    
    await validateEventPermissions(ctx, event.tripId);

    if (args.endDateTime <= args.startDateTime) {
      throw new Error('End time must be after start time');
    }

    await ctx.db.patch(args.eventId, {
      kind: 'timed',
      startDateTime: args.startDateTime,
      endDateTime: args.endDateTime,
      startDate: undefined,
      endDate: undefined,
      updatedAt: Date.now(),
    });
    
    return true;
  },
});

export const unscheduleEvent = mutation({
  args: { eventId: v.id('tripEvents') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error('Event not found');
    
    await validateEventPermissions(ctx, event.tripId);

    await ctx.db.patch(args.eventId, {
      kind: 'unscheduled',
      startDate: undefined,
      endDate: undefined,
      startDateTime: undefined,
      endDateTime: undefined,
      updatedAt: Date.now(),
    });
    
    return true;
  },
});