/**
 * Trip Domain Schema
 */
import { z } from 'zod';
export declare const TripSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    shareSlug: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    workspaceId: string;
    timezone: string;
    isPublic: boolean;
    shareSlug: string;
    updatedAt: Date;
    description?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    workspaceId: string;
    shareSlug: string;
    updatedAt: Date;
    description?: string | undefined;
    timezone?: string | undefined;
    isPublic?: boolean | undefined;
}>;
export type Trip = z.infer<typeof TripSchema>;
