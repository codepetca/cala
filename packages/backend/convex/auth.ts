import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // For demo purposes, return a demo user
    // In production, you would implement proper authentication
    const demoUser = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), 'demo@example.com'))
      .first();
    
    return demoUser;
  },
});

export const signInDemo = mutation({
  args: { 
    email: v.string(),
    name: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Simple demo auth - create or get user
    let user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (!user) {
      const name = args.name || args.email.split('@')[0];
      const userId = await ctx.db.insert('users', {
        name,
        email: args.email,
      });

      // Create default workspace
      const workspaceId = await ctx.db.insert('workspaces', {
        name: `${name}'s Workspace`,
        ownerId: userId,
        createdAt: Date.now(),
      });

      // Create membership
      await ctx.db.insert('memberships', {
        workspaceId,
        userId,
        role: 'owner',
      });

      user = await ctx.db.get(userId);
    }

    return user;
  },
});