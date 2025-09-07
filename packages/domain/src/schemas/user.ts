/**
 * User Domain Schema
 */

import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().describe('Unique user identifier'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .describe('User display name'),
  email: z.string()
    .email('Must be a valid email address')
    .describe('User email address (unique)'),
  createdAt: z.date().describe('When the user account was created'),
});

export type User = z.infer<typeof UserSchema>;