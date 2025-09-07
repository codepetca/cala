/**
 * Schema Helper Utilities
 *
 * Utility functions for working with generated JSON schemas,
 * validation, and data transformation for AI consumers.
 */
interface SchemaMetadata {
    name: string;
    description: string;
    version: string;
    generatedAt: string;
    sourceSchema: string;
}
interface GeneratedSchema {
    metadata: SchemaMetadata;
    schema: any;
}
interface SchemaRegistry {
    metadata: {
        description: string;
        version: string;
        generatedAt: string;
        totalSchemas: number;
    };
    schemas: string[];
    schemasByCategory: Record<string, string[]>;
}
/**
 * Load a specific JSON schema by name
 */
export declare function loadSchema(name: string): GeneratedSchema | null;
/**
 * Load the schema registry index
 */
export declare function loadSchemaRegistry(): SchemaRegistry | null;
/**
 * Get all available schema names
 */
export declare function getAvailableSchemas(): string[];
/**
 * Get schemas by category
 */
export declare function getSchemasByCategory(category: string): string[];
/**
 * Get all event-related schemas
 */
export declare function getEventSchemas(): string[];
/**
 * Get all core entity schemas
 */
export declare function getCoreSchemas(): string[];
/**
 * Get schema metadata without loading the full schema
 */
export declare function getSchemaMetadata(name: string): SchemaMetadata | null;
/**
 * Check if a schema exists
 */
export declare function schemaExists(name: string): boolean;
/**
 * Get the JSON Schema definition for a specific schema
 */
export declare function getJSONSchema(name: string): any;
/**
 * Load multiple schemas at once
 */
export declare function loadMultipleSchemas(names: string[]): Record<string, GeneratedSchema>;
/**
 * Get schema summary information
 */
export interface SchemaSummary {
    name: string;
    description: string;
    version: string;
    lastGenerated: Date;
    hasRequired: boolean;
    requiredFields?: string[];
}
export declare function getSchemaSummary(name: string): SchemaSummary | null;
/**
 * Get all schema summaries
 */
export declare function getAllSchemaSummaries(): SchemaSummary[];
/**
 * Format schema for AI prompt inclusion
 */
export declare function formatSchemaForPrompt(name: string, includeDescription?: boolean): string;
/**
 * Format multiple schemas for AI prompt inclusion
 */
export declare function formatSchemasForPrompt(names: string[], includeDescriptions?: boolean): string;
/**
 * Get schema validation rules as human-readable text
 */
export declare function getSchemaValidationRules(name: string): string[];
export type { SchemaMetadata, GeneratedSchema, SchemaRegistry, };
//# sourceMappingURL=schema-helpers.d.ts.map