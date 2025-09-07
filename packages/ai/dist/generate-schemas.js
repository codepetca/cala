#!/usr/bin/env node
"use strict";
/**
 * Auto-Sync Schema Generator
 *
 * Automatically converts Zod schemas to JSON Schema format for AI consumption.
 * Supports watch mode for development and build-time generation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchemas = generateSchemas;
const fs_1 = require("fs");
const path_1 = require("path");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const fs_2 = require("fs");
// Import all domain schemas
const trip_event_1 = require("@trip-planner/domain/src/schemas/trip-event");
const trip_1 = require("@trip-planner/domain/src/schemas/trip");
const user_1 = require("@trip-planner/domain/src/schemas/user");
const workspace_1 = require("@trip-planner/domain/src/schemas/workspace");
// Schema registry with metadata
const SCHEMA_REGISTRY = [
    {
        name: 'TripEvent',
        schema: trip_event_1.TripEventSchema,
        description: 'A trip event that can be unscheduled, all-day, or timed',
    },
    {
        name: 'TripEventRefined',
        schema: trip_event_1.TripEventRefinedSchema,
        description: 'Trip event with business rule validation',
    },
    {
        name: 'UnscheduledEvent',
        schema: trip_event_1.UnscheduledEventSchema,
        description: 'Event with no scheduled time',
    },
    {
        name: 'AllDayEvent',
        schema: trip_event_1.AllDayEventSchema,
        description: 'Event scheduled for full day(s)',
    },
    {
        name: 'TimedEvent',
        schema: trip_event_1.TimedEventSchema,
        description: 'Event with specific start/end times',
    },
    {
        name: 'Trip',
        schema: trip_1.TripSchema,
        description: 'A travel itinerary container',
    },
    {
        name: 'User',
        schema: user_1.UserSchema,
        description: 'Application user',
    },
    {
        name: 'Workspace',
        schema: workspace_1.WorkspaceSchema,
        description: 'Collaborative workspace for trip planning',
    },
    {
        name: 'WorkspaceMembership',
        schema: workspace_1.WorkspaceMembershipSchema,
        description: 'User membership in a workspace',
    },
    {
        name: 'MemberRole',
        schema: workspace_1.MemberRoleSchema,
        description: 'User role within a workspace',
    },
];
const OUTPUT_DIR = (0, path_1.join)(__dirname, 'schemas');
const VERSION = '1.0.0';
function generateSchemas() {
    console.log('🔄 Generating JSON schemas from Zod schemas...');
    // Ensure output directory exists
    if (!(0, fs_1.existsSync)(OUTPUT_DIR)) {
        (0, fs_1.mkdirSync)(OUTPUT_DIR, { recursive: true });
    }
    const generatedSchemas = {};
    let successCount = 0;
    for (const { name, schema, description } of SCHEMA_REGISTRY) {
        try {
            // Generate JSON Schema
            const jsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(schema, {
                name,
                $refStrategy: 'relative',
            });
            // Create schema with metadata
            const generatedSchema = {
                metadata: {
                    name,
                    description,
                    version: VERSION,
                    generatedAt: new Date().toISOString(),
                    sourceSchema: `@trip-planner/domain/schemas/${name}`,
                },
                schema: jsonSchema,
            };
            // Write individual schema file
            const schemaPath = (0, path_1.join)(OUTPUT_DIR, `${name}.json`);
            (0, fs_1.writeFileSync)(schemaPath, JSON.stringify(generatedSchema, null, 2));
            generatedSchemas[name] = generatedSchema;
            successCount++;
            console.log(`  ✓ Generated ${name}.json`);
        }
        catch (error) {
            console.error(`  ✗ Failed to generate ${name}:`, error);
            process.exit(1);
        }
    }
    // Write schema registry index
    const registryPath = (0, path_1.join)(OUTPUT_DIR, 'index.json');
    const registry = {
        metadata: {
            description: 'AI-consumable JSON schemas generated from Zod domain model',
            version: VERSION,
            generatedAt: new Date().toISOString(),
            totalSchemas: successCount,
        },
        schemas: Object.keys(generatedSchemas),
        schemasByCategory: {
            events: ['TripEvent', 'TripEventRefined', 'UnscheduledEvent', 'AllDayEvent', 'TimedEvent'],
            core: ['Trip', 'User', 'Workspace'],
            membership: ['WorkspaceMembership', 'MemberRole'],
        },
    };
    (0, fs_1.writeFileSync)(registryPath, JSON.stringify(registry, null, 2));
    console.log(`✅ Generated ${successCount} schemas successfully`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}
function watchMode() {
    console.log('👀 Watch mode enabled - monitoring domain schemas...');
    const domainSchemasPath = (0, path_1.join)(__dirname, '../../domain/src/schemas');
    if (!(0, fs_1.existsSync)(domainSchemasPath)) {
        console.error(`❌ Domain schemas path not found: ${domainSchemasPath}`);
        process.exit(1);
    }
    // Initial generation
    generateSchemas();
    // Watch for changes
    (0, fs_2.watch)(domainSchemasPath, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.ts')) {
            console.log(`🔍 Detected change in ${filename}, regenerating schemas...`);
            setTimeout(() => {
                try {
                    generateSchemas();
                }
                catch (error) {
                    console.error('❌ Failed to regenerate schemas:', error);
                }
            }, 100); // Small delay to avoid multiple rapid triggers
        }
    });
    console.log(`📂 Watching: ${domainSchemasPath}`);
    console.log('Press Ctrl+C to stop watching...');
}
function main() {
    const args = process.argv.slice(2);
    const isWatchMode = args.includes('--watch') || args.includes('-w');
    console.log('🚀 AI Schema Generator');
    console.log(`📦 Version: ${VERSION}`);
    console.log('');
    if (isWatchMode) {
        watchMode();
    }
    else {
        generateSchemas();
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down schema generator...');
    process.exit(0);
});
if (require.main === module) {
    main();
}
//# sourceMappingURL=generate-schemas.js.map