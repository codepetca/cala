/**
 * User Domain Schema
 */
import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}, {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}>;
export type User = z.infer<typeof UserSchema>;
