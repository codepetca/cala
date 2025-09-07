/**
 * Trip Planner AI Integration Package
 *
 * Provides AI-native infrastructure for working with our schema-first domain model.
 * Includes JSON Schema generation, validation utilities, and type-safe domain bridges.
 */
export { generateSchemas } from './generate-schemas';
export { validateSchemas } from './validate-schemas';
export { AIEventOperations, AISchemaUtils, } from './domain-bridge';
export type { AIResult, AIError, } from './domain-bridge';
export { loadSchema, loadSchemaRegistry, getAvailableSchemas, getSchemasByCategory, getEventSchemas, getCoreSchemas, getSchemaMetadata, schemaExists, getJSONSchema, loadMultipleSchemas, getSchemaSummary, getAllSchemaSummaries, formatSchemaForPrompt, formatSchemasForPrompt, getSchemaValidationRules, } from './utils/schema-helpers';
export type { SchemaMetadata, GeneratedSchema, SchemaRegistry, SchemaSummary, } from './utils/schema-helpers';
export type { TripEvent, UnscheduledEvent, AllDayEvent, TimedEvent, EventKind, } from '@trip-planner/domain/src/schemas/trip-event';
export type { Trip } from '@trip-planner/domain/src/schemas/trip';
export type { User } from '@trip-planner/domain/src/schemas/user';
export type { Workspace } from '@trip-planner/domain/src/schemas/workspace';
//# sourceMappingURL=index.d.ts.map