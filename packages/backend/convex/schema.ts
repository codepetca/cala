import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index('by_email', ['email']),

  workspaces: defineTable({
    name: v.string(),
    ownerId: v.string(),
    createdAt: v.number(),
  }).index('by_owner', ['ownerId']),

  memberships: defineTable({
    workspaceId: v.id('workspaces'),
    userId: v.id('users'),
    role: v.union(v.literal('owner'), v.literal('editor'), v.literal('viewer')),
  })
    .index('by_workspace', ['workspaceId'])
    .index('by_user', ['userId'])
    .index('by_workspace_user', ['workspaceId', 'userId']),

  trips: defineTable({
    workspaceId: v.id('workspaces'),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    shareSlug: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workspace', ['workspaceId'])
    .index('by_shareSlug', ['shareSlug']),

  tripEvents: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_trip', ['tripId'])
    .index('by_kind', ['tripId', 'kind'])
    .index('by_start_date', ['tripId', 'startDate'])
    .index('by_start_datetime', ['tripId', 'startDateTime']),
});