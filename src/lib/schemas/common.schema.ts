import { z } from 'zod';

/**
 * Common validation schemas and utilities
 */

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * ID schema for consistent validation
 */
export const IdSchema = z.string().min(1, 'ID cannot be empty');

/**
 * Date range schema for validation
 */
export const DateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

/**
 * Color schema for hex colors
 */
export const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color');

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  TOO_SHORT: 'This field is too short',
  TOO_LONG: 'This field is too long',
  INVALID_DATE: 'Invalid date format',
  INVALID_COLOR: 'Must be a valid hex color (e.g., #FF0000)',
} as const;