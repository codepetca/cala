#!/usr/bin/env node

/**
 * Auto-Sync Schema Generator
 * 
 * Automatically converts Zod schemas to JSON Schema format for AI consumption.
 * Supports watch mode for development and build-time generation.
 */

import { writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { watch } from 'fs';

// Import all domain schemas
import {
  TripEventSchema,
  TripEventRefinedSchema,
  UnscheduledEventSchema,
  AllDayEventSchema,
  TimedEventSchema,
} from '@trip-planner/domain/src/schemas/trip-event';

import {
  TripSchema,
} from '@trip-planner/domain/src/schemas/trip';

import {
  UserSchema,
} from '@trip-planner/domain/src/schemas/user';

import {
  WorkspaceSchema,
  WorkspaceMembershipSchema,
  MemberRoleSchema,
} from '@trip-planner/domain/src/schemas/workspace';

interface SchemaMetadata {
  name: string;
  description: string;
  version: string;
  sourceSchema: string;
}

interface GeneratedSchema {
  metadata: SchemaMetadata;
  schema: any;
}

// Schema registry with metadata
const SCHEMA_REGISTRY = [
  {
    name: 'TripEvent',
    schema: TripEventSchema,
    description: 'A trip event that can be unscheduled, all-day, or timed',
  },
  {
    name: 'TripEventRefined',
    schema: TripEventRefinedSchema,
    description: 'Trip event with business rule validation',
  },
  {
    name: 'UnscheduledEvent',
    schema: UnscheduledEventSchema,
    description: 'Event with no scheduled time',
  },
  {
    name: 'AllDayEvent',
    schema: AllDayEventSchema,
    description: 'Event scheduled for full day(s)',
  },
  {
    name: 'TimedEvent',
    schema: TimedEventSchema,
    description: 'Event with specific start/end times',
  },
  {
    name: 'Trip',
    schema: TripSchema,
    description: 'A travel itinerary container',
  },
  {
    name: 'User',
    schema: UserSchema,
    description: 'Application user',
  },
  {
    name: 'Workspace',
    schema: WorkspaceSchema,
    description: 'Collaborative workspace for trip planning',
  },
  {
    name: 'WorkspaceMembership',
    schema: WorkspaceMembershipSchema,
    description: 'User membership in a workspace',
  },
  {
    name: 'MemberRole',
    schema: MemberRoleSchema,
    description: 'User role within a workspace',
  },
];

const OUTPUT_DIR = join(__dirname, 'schemas');
const VERSION = '1.0.0';

function generateSchemas(): void {
  console.log('🔄 Generating JSON schemas from Zod schemas...');
  
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const generatedSchemas: Record<string, GeneratedSchema> = {};
  let successCount = 0;

  for (const { name, schema, description } of SCHEMA_REGISTRY) {
    try {
      // Generate JSON Schema
      const jsonSchema = zodToJsonSchema(schema, {
        name,
        $refStrategy: 'relative',
      });

      // Create schema with metadata
      const generatedSchema: GeneratedSchema = {
        metadata: {
          name,
          description,
          version: VERSION,
          sourceSchema: `@trip-planner/domain/schemas/${name}`,
        },
        schema: jsonSchema,
      };

      // Write individual schema file
      const schemaPath = join(OUTPUT_DIR, `${name}.json`);
      writeFileSync(schemaPath, JSON.stringify(generatedSchema, null, 2));
      
      generatedSchemas[name] = generatedSchema;
      successCount++;
      
      console.log(`  ✓ Generated ${name}.json`);
    } catch (error) {
      console.error(`  ✗ Failed to generate ${name}:`, error);
      process.exit(1);
    }
  }

  // Write schema registry index
  const registryPath = join(OUTPUT_DIR, 'index.json');
  const registry = {
    metadata: {
      description: 'AI-consumable JSON schemas generated from Zod domain model',
      version: VERSION,
      totalSchemas: successCount,
    },
    schemas: Object.keys(generatedSchemas),
    schemasByCategory: {
      events: ['TripEvent', 'TripEventRefined', 'UnscheduledEvent', 'AllDayEvent', 'TimedEvent'],
      core: ['Trip', 'User', 'Workspace'],
      membership: ['WorkspaceMembership', 'MemberRole'],
    },
  };

  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  
  console.log(`✅ Generated ${successCount} schemas successfully`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}

function watchMode(): void {
  console.log('👀 Watch mode enabled - monitoring domain schemas...');
  
  const domainSchemasPath = join(__dirname, '../../domain/src/schemas');
  
  if (!existsSync(domainSchemasPath)) {
    console.error(`❌ Domain schemas path not found: ${domainSchemasPath}`);
    process.exit(1);
  }

  // Initial generation
  generateSchemas();

  // Watch for changes
  watch(domainSchemasPath, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.ts')) {
      console.log(`🔍 Detected change in ${filename}, regenerating schemas...`);
      setTimeout(() => {
        try {
          generateSchemas();
        } catch (error) {
          console.error('❌ Failed to regenerate schemas:', error);
        }
      }, 100); // Small delay to avoid multiple rapid triggers
    }
  });

  console.log(`📂 Watching: ${domainSchemasPath}`);
  console.log('Press Ctrl+C to stop watching...');
}

function main(): void {
  const args = process.argv.slice(2);
  const isWatchMode = args.includes('--watch') || args.includes('-w');

  console.log('🚀 AI Schema Generator');
  console.log(`📦 Version: ${VERSION}`);
  console.log('');

  if (isWatchMode) {
    watchMode();
  } else {
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

export { generateSchemas };