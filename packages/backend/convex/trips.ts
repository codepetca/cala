import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireWorkspaceMembership } from './workspaces';

// Simple validation function for trip input
function validateTripInput(args: any) {
  if (!args.name || args.name.length === 0 || args.name.length > 100) {
    throw new Error('Trip name must be between 1 and 100 characters');
  }
  if (!args.workspaceId) {
    throw new Error('Workspace ID is required');
  }
  if (args.description && args.description.length > 500) {
    throw new Error('Trip description must be 500 characters or less');
  }
}

// Simple ID generator instead of nanoid
function generateShareSlug(): string {
  return Math.random().toString(36).substr(2, 10);
}

export const createTrip = mutation({
  args: { 
    workspaceId: v.id('workspaces'), 
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    validateTripInput(args);
    
    try {
      await requireWorkspaceMembership(ctx, args.workspaceId, 'editor');
    } catch (error) {
      throw new Error(`Permission error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    const shareSlug = generateShareSlug();
    const now = Date.now();
    
    const tripId = await ctx.db.insert('trips', {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      isPublic: false,
      shareSlug,
      createdAt: now,
      updatedAt: now,
    });

    return tripId;
  },
});

export const getWorkspaceTrips = query({
  args: { workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    await requireWorkspaceMembership(ctx, args.workspaceId);
    
    return ctx.db
      .query('trips')
      .withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();
  },
});

export const getTripById = query({
  args: { tripId: v.id('trips') },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;
    
    await requireWorkspaceMembership(ctx, trip.workspaceId);
    return trip;
  },
});

export const getTripByShareSlug = query({
  args: { shareSlug: v.string() },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query('trips')
      .withIndex('by_shareSlug', (q) => q.eq('shareSlug', args.shareSlug))
      .first();
      
    if (!trip || !trip.isPublic) {
      return null;
    }
    
    return trip;
  },
});

export const updateTrip = mutation({
  args: {
    tripId: v.id('trips'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error('Trip not found');
    
    await requireWorkspaceMembership(ctx, trip.workspaceId, 'editor');

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      validateTripInput({ ...trip, name: args.name });
      updates.name = args.name;
    }
    if (args.description !== undefined) {
      validateTripInput({ ...trip, description: args.description });
      updates.description = args.description;
    }
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic;

    await ctx.db.patch(args.tripId, updates);
    return true;
  },
});

export const deleteTrip = mutation({
  args: { tripId: v.id('trips') },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error('Trip not found');
    
    try {
      await requireWorkspaceMembership(ctx, trip.workspaceId, 'owner');
    } catch (error) {
      throw new Error(`Permission error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const events = await ctx.db
      .query('tripEvents')
      .withIndex('by_trip', (q) => q.eq('tripId', args.tripId))
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    await ctx.db.delete(args.tripId);
    return true;
  },
});