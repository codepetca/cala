"use strict";
/**
 * Schema Helper Utilities
 *
 * Utility functions for working with generated JSON schemas,
 * validation, and data transformation for AI consumers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSchema = loadSchema;
exports.loadSchemaRegistry = loadSchemaRegistry;
exports.getAvailableSchemas = getAvailableSchemas;
exports.getSchemasByCategory = getSchemasByCategory;
exports.getEventSchemas = getEventSchemas;
exports.getCoreSchemas = getCoreSchemas;
exports.getSchemaMetadata = getSchemaMetadata;
exports.schemaExists = schemaExists;
exports.getJSONSchema = getJSONSchema;
exports.loadMultipleSchemas = loadMultipleSchemas;
exports.getSchemaSummary = getSchemaSummary;
exports.getAllSchemaSummaries = getAllSchemaSummaries;
exports.formatSchemaForPrompt = formatSchemaForPrompt;
exports.formatSchemasForPrompt = formatSchemasForPrompt;
exports.getSchemaValidationRules = getSchemaValidationRules;
const fs_1 = require("fs");
const path_1 = require("path");
const SCHEMAS_DIR = (0, path_1.join)(__dirname, '../schemas');
/**
 * Load a specific JSON schema by name
 */
function loadSchema(name) {
    try {
        const schemaPath = (0, path_1.join)(SCHEMAS_DIR, `${name}.json`);
        const content = (0, fs_1.readFileSync)(schemaPath, 'utf8');
        return JSON.parse(content);
    }
    catch (error) {
        console.warn(`Failed to load schema ${name}:`, error);
        return null;
    }
}
/**
 * Load the schema registry index
 */
function loadSchemaRegistry() {
    try {
        const registryPath = (0, path_1.join)(SCHEMAS_DIR, 'index.json');
        const content = (0, fs_1.readFileSync)(registryPath, 'utf8');
        return JSON.parse(content);
    }
    catch (error) {
        console.warn('Failed to load schema registry:', error);
        return null;
    }
}
/**
 * Get all available schema names
 */
function getAvailableSchemas() {
    const registry = loadSchemaRegistry();
    return registry ? registry.schemas : [];
}
/**
 * Get schemas by category
 */
function getSchemasByCategory(category) {
    const registry = loadSchemaRegistry();
    return registry?.schemasByCategory[category] || [];
}
/**
 * Get all event-related schemas
 */
function getEventSchemas() {
    return getSchemasByCategory('events');
}
/**
 * Get all core entity schemas
 */
function getCoreSchemas() {
    return getSchemasByCategory('core');
}
/**
 * Get schema metadata without loading the full schema
 */
function getSchemaMetadata(name) {
    const schema = loadSchema(name);
    return schema ? schema.metadata : null;
}
/**
 * Check if a schema exists
 */
function schemaExists(name) {
    return getAvailableSchemas().includes(name);
}
/**
 * Get the JSON Schema definition for a specific schema
 */
function getJSONSchema(name) {
    const schema = loadSchema(name);
    return schema ? schema.schema : null;
}
/**
 * Load multiple schemas at once
 */
function loadMultipleSchemas(names) {
    const result = {};
    for (const name of names) {
        const schema = loadSchema(name);
        if (schema) {
            result[name] = schema;
        }
    }
    return result;
}
function getSchemaSummary(name) {
    const schema = loadSchema(name);
    if (!schema)
        return null;
    const jsonSchema = schema.schema;
    // Handle different schema structures
    let hasRequired = false;
    let requiredFields = [];
    if (jsonSchema.required) {
        hasRequired = jsonSchema.required.length > 0;
        requiredFields = jsonSchema.required;
    }
    else if (jsonSchema.definitions && jsonSchema.definitions[name]) {
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
function getAllSchemaSummaries() {
    const names = getAvailableSchemas();
    return names.map(getSchemaSummary).filter(Boolean);
}
/**
 * Format schema for AI prompt inclusion
 */
function formatSchemaForPrompt(name, includeDescription = true) {
    const schema = loadSchema(name);
    if (!schema)
        return `Schema "${name}" not found`;
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
function formatSchemasForPrompt(names, includeDescriptions = true) {
    return names.map(name => formatSchemaForPrompt(name, includeDescriptions)).join('\n\n');
}
/**
 * Get schema validation rules as human-readable text
 */
function getSchemaValidationRules(name) {
    const schema = loadSchema(name);
    if (!schema)
        return [];
    const rules = [];
    const jsonSchema = schema.schema;
    // Handle schema with definitions wrapper
    let targetSchema = jsonSchema;
    if (jsonSchema.definitions && jsonSchema.definitions[name]) {
        targetSchema = jsonSchema.definitions[name];
    }
    // Check for discriminated unions (our event types)
    if (targetSchema.anyOf) {
        rules.push('This is a discriminated union - must match exactly one variant');
        targetSchema.anyOf.forEach((variant, index) => {
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
        Object.entries(schemaToCheck.properties).forEach(([field, props]) => {
            if (props.type === 'string') {
                if (props.minLength)
                    rules.push(`${field}: minimum ${props.minLength} characters`);
                if (props.maxLength)
                    rules.push(`${field}: maximum ${props.maxLength} characters`);
                if (props.format)
                    rules.push(`${field}: must be ${props.format} format`);
            }
        });
    }
    return rules;
}
//# sourceMappingURL=schema-helpers.js.map