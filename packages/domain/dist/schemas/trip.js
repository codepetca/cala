"use strict";
/**
 * Trip Domain Schema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripSchema = void 0;
const zod_1 = require("zod");
exports.TripSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique trip identifier'),
    workspaceId: zod_1.z.string().describe('ID of the workspace this trip belongs to'),
    name: zod_1.z.string()
        .min(1, 'Trip name is required')
        .max(100, 'Trip name must be 100 characters or less')
        .describe('Trip name/title'),
    description: zod_1.z.string()
        .max(1000, 'Description must be 1000 characters or less')
        .optional()
        .describe('Optional trip description'),
    timezone: zod_1.z.string()
        .default('UTC')
        .describe('Trip timezone (IANA timezone identifier)'),
    isPublic: zod_1.z.boolean()
        .default(false)
        .describe('Whether this trip is publicly shareable'),
    shareSlug: zod_1.z.string()
        .min(1)
        .describe('Unique slug for public sharing'),
    createdAt: zod_1.z.date().describe('When the trip was created'),
    updatedAt: zod_1.z.date().describe('When the trip was last updated'),
});
