import { mutation } from './_generated/server';

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const demoUserId = await ctx.db.insert('users', {
      name: 'Demo User',
      email: 'demo@example.com',
    });

    const workspaceId = await ctx.db.insert('workspaces', {
      name: 'Demo Workspace',
      ownerId: demoUserId,
      createdAt: Date.now(),
    });

    await ctx.db.insert('memberships', {
      workspaceId,
      userId: demoUserId,
      role: 'owner',
    });

    const tripId = await ctx.db.insert('trips', {
      workspaceId,
      name: 'Japan 2026',
      description: 'Two-week adventure exploring Tokyo, Mount Fuji, and Kyoto',
      isPublic: true,
      shareSlug: 'demo-japan-2026',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Unscheduled events
    await ctx.db.insert('tripEvents', {
      tripId,
      title: 'Book flights to Tokyo',
      notes: 'Check ANA, JAL, and United for best prices',
      kind: 'unscheduled',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('tripEvents', {
      tripId,
      title: 'Research accommodations',
      notes: 'Look into ryokans vs hotels in different districts',
      kind: 'unscheduled',
      createdAt: now,
      updatedAt: now,
    });

    // All-day events
    await ctx.db.insert('tripEvents', {
      tripId,
      title: 'Tokyo arrival and city exploration',
      notes: 'Shibuya, Harajuku, Tsukiji market',
      kind: 'allDay',
      startDate: now + oneDay * 30,
      endDate: now + oneDay * 32,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('tripEvents', {
      tripId,
      title: 'Mount Fuji day trip',
      notes: 'Weather dependent - have backup indoor activities',
      kind: 'allDay',
      startDate: now + oneDay * 33,
      endDate: now + oneDay * 33,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('tripEvents', {
      tripId,
      title: 'Kyoto temples and gardens',
      notes: 'Kinkaku-ji, Fushimi Inari, bamboo grove',
      kind: 'allDay',
      startDate: now + oneDay * 34,
      endDate: now + oneDay * 36,
      createdAt: now,
      updatedAt: now,
    });

    // Timed event example
    await ctx.db.insert('tripEvents', {
      tripId,
      title: 'Flight departure to Tokyo',
      notes: 'Gate opens 2 hours early, arrive at airport 3 hours before',
      kind: 'timed',
      startDateTime: now + oneDay * 29 + 10 * 60 * 60 * 1000, // 10 AM
      endDateTime: now + oneDay * 30 + 6 * 60 * 60 * 1000, // 6 AM next day (with travel time)
      createdAt: now,
      updatedAt: now,
    });

    return {
      message: 'Demo data seeded successfully',
      workspaceId,
      tripId,
      shareSlug: 'demo-japan-2026',
    };
  },
});