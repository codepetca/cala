import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getUserWorkspaces = query({
  args: { userEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // For demo, use provided email or default demo user
    const email = args.userEmail || 'demo@example.com';
    
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();

    if (!user) return [];

    const memberships = await ctx.db
      .query('memberships')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    const workspaces = await Promise.all(
      memberships.map(async (membership) => {
        const workspace = await ctx.db.get(membership.workspaceId);
        return workspace ? { ...workspace, role: membership.role } : null;
      })
    );

    return workspaces.filter(Boolean);
  },
});

async function requireWorkspaceMembership(
  ctx: any,
  workspaceId: string,
  minRole: 'viewer' | 'editor' | 'owner' = 'viewer'
) {
  // For demo purposes, use demo user
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q: any) => q.eq('email', 'demo@example.com'))
    .first();

  if (!user) throw new Error('Demo user not found');

  const membership = await ctx.db
    .query('memberships')
    .withIndex('by_workspace_user', (q: any) => 
      q.eq('workspaceId', workspaceId).eq('userId', user._id)
    )
    .first();

  if (!membership) throw new Error('Not a workspace member');

  const roleHierarchy = { viewer: 0, editor: 1, owner: 2 } as const;
  const userRoleLevel = roleHierarchy[membership.role as keyof typeof roleHierarchy];
  const requiredRoleLevel = roleHierarchy[minRole];

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error('Insufficient permissions');
  }

  return { user, membership };
}

export { requireWorkspaceMembership };