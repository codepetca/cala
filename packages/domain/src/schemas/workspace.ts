/**
 * Workspace Domain Schema
 */

import { z } from 'zod';

export const WorkspaceSchema = z.object({
  id: z.string().describe('Unique workspace identifier'),
  name: z.string()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must be 100 characters or less')
    .describe('Workspace name'),
  ownerId: z.string().describe('ID of the user who owns this workspace'),
  createdAt: z.date().describe('When the workspace was created'),
});

// Workspace member roles in hierarchy order
export const MemberRoleSchema = z.enum(['viewer', 'editor', 'owner'])
  .describe('Member role within a workspace');

export const WorkspaceMembershipSchema = z.object({
  id: z.string().describe('Unique membership identifier'),
  workspaceId: z.string().describe('ID of the workspace'),
  userId: z.string().describe('ID of the user'),
  role: MemberRoleSchema.describe('User role in this workspace'),
  createdAt: z.date().describe('When the membership was created'),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
export type MemberRole = z.infer<typeof MemberRoleSchema>;
export type WorkspaceMembership = z.infer<typeof WorkspaceMembershipSchema>;