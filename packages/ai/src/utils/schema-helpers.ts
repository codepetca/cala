/**
 * Schema Helper Utilities
 * 
 * Utility functions for working with generated JSON schemas,
 * validation, and data transformation for AI consumers.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

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

const SCHEMAS_DIR = join(__dirname, '../schemas');

/**
 * Load a specific JSON schema by name
 */
export function loadSchema(name: string): GeneratedSchema | null {
  try {
    const schemaPath = join(SCHEMAS_DIR, `${name}.json`);
    const content = readFileSync(schemaPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Failed to load schema ${name}:`, error);
    return null;
  }
}

/**
 * Load the schema registry index
 */
export function loadSchemaRegistry(): SchemaRegistry | null {
  try {
    const registryPath = join(SCHEMAS_DIR, 'index.json');
    const content = readFileSync(registryPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load schema registry:', error);
    return null;
  }
}

/**
 * Get all available schema names
 */
export function getAvailableSchemas(): string[] {
  const registry = loadSchemaRegistry();
  return registry ? registry.schemas : [];
}

/**
 * Get schemas by category
 */
export function getSchemasByCategory(category: string): string[] {
  const registry = loadSchemaRegistry();
  return registry?.schemasByCategory[category] || [];
}

/**
 * Get all event-related schemas
 */
export function getEventSchemas(): string[] {
  return getSchemasByCategory('events');
}

/**
 * Get all core entity schemas
 */
export function getCoreSchemas(): string[] {
  return getSchemasByCategory('core');
}

/**
 * Get schema metadata without loading the full schema
 */
export function getSchemaMetadata(name: string): SchemaMetadata | null {
  const schema = loadSchema(name);
  return schema ? schema.metadata : null;
}

/**
 * Check if a schema exists
 */
export function schemaExists(name: string): boolean {
  return getAvailableSchemas().includes(name);
}

/**
 * Get the JSON Schema definition for a specific schema
 */
export function getJSONSchema(name: string): any {
  const schema = loadSchema(name);
  return schema ? schema.schema : null;
}

/**
 * Load multiple schemas at once
 */
export function loadMultipleSchemas(names: string[]): Record<string, GeneratedSchema> {
  const result: Record<string, GeneratedSchema> = {};
  
  for (const name of names) {
    const schema = loadSchema(name);
    if (schema) {
      result[name] = schema;
    }
  }
  
  return result;
}

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

export function getSchemaSummary(name: string): SchemaSummary | null {
  const schema = loadSchema(name);
  if (!schema) return null;

  const jsonSchema = schema.schema;
  
  // Handle different schema structures
  let hasRequired = false;
  let requiredFields: string[] = [];
  
  if (jsonSchema.required) {
    hasRequired = jsonSchema.required.length > 0;
    requiredFields = jsonSchema.required;
  } else if (jsonSchema.definitions && jsonSchema.definitions[name]) {
    const definition = jsonSchema.definitions[name];
    if (definition.anyOf && definition.anyOf[0] && definition.anyOf[0].required) {
      hasRequired = definition.anyOf[0].required.length > 0;
      requiredFields = definition.anyOf[0].required;
    }
  }
  
  return {
    name: schema.metadata.name,
    description: schema.metadata.description,
    version: schema.metadata.version,
    lastGenerated: new Date(schema.metadata.generatedAt),
    hasRequired,
    requiredFields,
  };
}

/**
 * Get all schema summaries
 */
export function getAllSchemaSummaries(): SchemaSummary[] {
  const names = getAvailableSchemas();
  return names.map(getSchemaSummary).filter(Boolean) as SchemaSummary[];
}

/**
 * Format schema for AI prompt inclusion
 */
export function formatSchemaForPrompt(name: string, includeDescription = true): string {
  const schema = loadSchema(name);
  if (!schema) return `Schema "${name}" not found`;

  let prompt = `## ${name} Schema\n`;
  
  if (includeDescription) {
    prompt += `${schema.metadata.description}\n\n`;
  }
  
  prompt += '```json\n';
  prompt += JSON.stringify(schema.schema, null, 2);
  prompt += '\n```\n';
  
  return prompt;
}

/**
 * Format multiple schemas for AI prompt inclusion
 */
export function formatSchemasForPrompt(names: string[], includeDescriptions = true): string {
  return names.map(name => formatSchemaForPrompt(name, includeDescriptions)).join('\n\n');
}

/**
 * Get schema validation rules as human-readable text
 */
export function getSchemaValidationRules(name: string): string[] {
  const schema = loadSchema(name);
  if (!schema) return [];

  const rules: string[] = [];
  const jsonSchema = schema.schema;

  // Handle schema with definitions wrapper
  let targetSchema = jsonSchema;
  if (jsonSchema.definitions && jsonSchema.definitions[name]) {
    targetSchema = jsonSchema.definitions[name];
  }

  // Check for discriminated unions (our event types)
  if (targetSchema.anyOf) {
    rules.push('This is a discriminated union - must match exactly one variant');
    targetSchema.anyOf.forEach((variant: any, index: number) => {
      if (variant.properties?.kind?.const) {
        rules.push(`Variant ${index + 1}: kind must be "${variant.properties.kind.const}"`);
      }
    });
  }

  // Required fields (check first variant for discriminated unions)
  const schemaToCheck = targetSchema.anyOf ? targetSchema.anyOf[0] : targetSchema;
  if (schemaToCheck.required) {
    rules.push(`Required fields: ${schemaToCheck.required.join(', ')}`);
  }

  // String constraints (check first variant for discriminated unions)
  if (schemaToCheck.properties) {
    Object.entries(schemaToCheck.properties).forEach(([field, props]: [string, any]) => {
      if (props.type === 'string') {
        if (props.minLength) rules.push(`${field}: minimum ${props.minLength} characters`);
        if (props.maxLength) rules.push(`${field}: maximum ${props.maxLength} characters`);
        if (props.format) rules.push(`${field}: must be ${props.format} format`);
      }
    });
  }

  return rules;
}

export type {
  SchemaMetadata,
  GeneratedSchema,
  SchemaRegistry,
};