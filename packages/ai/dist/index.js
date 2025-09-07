"use strict";
/**
 * Trip Planner AI Integration Package
 *
 * Provides AI-native infrastructure for working with our schema-first domain model.
 * Includes JSON Schema generation, validation utilities, and type-safe domain bridges.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaValidationRules = exports.formatSchemasForPrompt = exports.formatSchemaForPrompt = exports.getAllSchemaSummaries = exports.getSchemaSummary = exports.loadMultipleSchemas = exports.getJSONSchema = exports.schemaExists = exports.getSchemaMetadata = exports.getCoreSchemas = exports.getEventSchemas = exports.getSchemasByCategory = exports.getAvailableSchemas = exports.loadSchemaRegistry = exports.loadSchema = exports.AISchemaUtils = exports.AIEventOperations = exports.validateSchemas = exports.generateSchemas = void 0;
// Schema generation and management
var generate_schemas_1 = require("./generate-schemas");
Object.defineProperty(exports, "generateSchemas", { enumerable: true, get: function () { return generate_schemas_1.generateSchemas; } });
var validate_schemas_1 = require("./validate-schemas");
Object.defineProperty(exports, "validateSchemas", { enumerable: true, get: function () { return validate_schemas_1.validateSchemas; } });
// AI domain bridge for type-safe operations
var domain_bridge_1 = require("./domain-bridge");
Object.defineProperty(exports, "AIEventOperations", { enumerable: true, get: function () { return domain_bridge_1.AIEventOperations; } });
Object.defineProperty(exports, "AISchemaUtils", { enumerable: true, get: function () { return domain_bridge_1.AISchemaUtils; } });
// Schema utility functions
var schema_helpers_1 = require("./utils/schema-helpers");
Object.defineProperty(exports, "loadSchema", { enumerable: true, get: function () { return schema_helpers_1.loadSchema; } });
Object.defineProperty(exports, "loadSchemaRegistry", { enumerable: true, get: function () { return schema_helpers_1.loadSchemaRegistry; } });
Object.defineProperty(exports, "getAvailableSchemas", { enumerable: true, get: function () { return schema_helpers_1.getAvailableSchemas; } });
Object.defineProperty(exports, "getSchemasByCategory", { enumerable: true, get: function () { return schema_helpers_1.getSchemasByCategory; } });
Object.defineProperty(exports, "getEventSchemas", { enumerable: true, get: function () { return schema_helpers_1.getEventSchemas; } });
Object.defineProperty(exports, "getCoreSchemas", { enumerable: true, get: function () { return schema_helpers_1.getCoreSchemas; } });
Object.defineProperty(exports, "getSchemaMetadata", { enumerable: true, get: function () { return schema_helpers_1.getSchemaMetadata; } });
Object.defineProperty(exports, "schemaExists", { enumerable: true, get: function () { return schema_helpers_1.schemaExists; } });
Object.defineProperty(exports, "getJSONSchema", { enumerable: true, get: function () { return schema_helpers_1.getJSONSchema; } });
Object.defineProperty(exports, "loadMultipleSchemas", { enumerable: true, get: function () { return schema_helpers_1.loadMultipleSchemas; } });
Object.defineProperty(exports, "getSchemaSummary", { enumerable: true, get: function () { return schema_helpers_1.getSchemaSummary; } });
Object.defineProperty(exports, "getAllSchemaSummaries", { enumerable: true, get: function () { return schema_helpers_1.getAllSchemaSummaries; } });
Object.defineProperty(exports, "formatSchemaForPrompt", { enumerable: true, get: function () { return schema_helpers_1.formatSchemaForPrompt; } });
Object.defineProperty(exports, "formatSchemasForPrompt", { enumerable: true, get: function () { return schema_helpers_1.formatSchemasForPrompt; } });
Object.defineProperty(exports, "getSchemaValidationRules", { enumerable: true, get: function () { return schema_helpers_1.getSchemaValidationRules; } });
//# sourceMappingURL=index.js.map