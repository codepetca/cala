/**
 * Workspace Domain Schema
 */
import { z } from 'zod';
export declare const WorkspaceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    ownerId: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    ownerId: string;
}, {
    id: string;
    name: string;
    createdAt: Date;
    ownerId: string;
}>;
export declare const MemberRoleSchema: z.ZodEnum<["viewer", "editor", "owner"]>;
export declare const WorkspaceMembershipSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    userId: z.ZodString;
    role: z.ZodEnum<["viewer", "editor", "owner"]>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    workspaceId: string;
    userId: string;
    role: "viewer" | "editor" | "owner";
}, {
    id: string;
    createdAt: Date;
    workspaceId: string;
    userId: string;
    role: "viewer" | "editor" | "owner";
}>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type MemberRole = z.infer<typeof MemberRoleSchema>;
export type WorkspaceMembership = z.infer<typeof WorkspaceMembershipSchema>;
