/**
 * Trip Domain Schema
 */

import { z } from 'zod';

export const TripSchema = z.object({
  id: z.string().describe('Unique trip identifier'),
  workspaceId: z.string().describe('ID of the workspace this trip belongs to'),
  name: z.string()
    .min(1, 'Trip name is required')
    .max(100, 'Trip name must be 100 characters or less')
    .describe('Trip name/title'),
  description: z.string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .describe('Optional trip description'),
  startDate: z.date()
    .optional()
    .describe('Trip start date for planning views'),
  endDate: z.date()
    .optional()
    .describe('Trip end date for planning views'),
  timezone: z.string()
    .default('UTC')
    .describe('Trip timezone (IANA timezone identifier)'),
  isPublic: z.boolean()
    .default(false)
    .describe('Whether this trip is publicly shareable'),
  shareSlug: z.string()
    .min(1)
    .describe('Unique slug for public sharing'),
  createdAt: z.date().describe('When the trip was created'),
  updatedAt: z.date().describe('When the trip was last updated'),
});

export type Trip = z.infer<typeof TripSchema>;