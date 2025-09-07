"use strict";
/**
 * Workspace Domain Schema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceMembershipSchema = exports.MemberRoleSchema = exports.WorkspaceSchema = void 0;
const zod_1 = require("zod");
exports.WorkspaceSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique workspace identifier'),
    name: zod_1.z.string()
        .min(1, 'Workspace name is required')
        .max(100, 'Workspace name must be 100 characters or less')
        .describe('Workspace name'),
    ownerId: zod_1.z.string().describe('ID of the user who owns this workspace'),
    createdAt: zod_1.z.date().describe('When the workspace was created'),
});
// Workspace member roles in hierarchy order
exports.MemberRoleSchema = zod_1.z.enum(['viewer', 'editor', 'owner'])
    .describe('Member role within a workspace');
exports.WorkspaceMembershipSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique membership identifier'),
    workspaceId: zod_1.z.string().describe('ID of the workspace'),
    userId: zod_1.z.string().describe('ID of the user'),
    role: exports.MemberRoleSchema.describe('User role in this workspace'),
    createdAt: zod_1.z.date().describe('When the membership was created'),
});
