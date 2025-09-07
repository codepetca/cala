/**
 * Trip Planner Domain Package
 * 
 * Schema-first domain model with Zod schemas and pure functions.
 */

// Schema exports
export * from './schemas/user';
export * from './schemas/workspace';
export * from './schemas/trip';
export * from './schemas/trip-event';

// Function exports
export * from './functions/event-scheduling';