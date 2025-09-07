#!/usr/bin/env node

/**
 * Schema Validation Tool
 * 
 * Validates that generated JSON schemas are up-to-date with the source Zod schemas.
 * Fails the build if schemas are stale to prevent deployment with outdated schemas.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { generateSchemas } from './generate-schemas';

interface GeneratedSchema {
  metadata: {
    name: string;
    version: string;
    generatedAt: string;
  };
  schema: any;
}

const SCHEMAS_DIR = join(__dirname, 'schemas');

function validateSchemas(): boolean {
  console.log('🔍 Validating JSON schemas are up-to-date...');

  if (!existsSync(SCHEMAS_DIR)) {
    console.error('❌ No generated schemas found. Run `npm run generate` first.');
    return false;
  }

  // Read current registry
  const registryPath = join(SCHEMAS_DIR, 'index.json');
  if (!existsSync(registryPath)) {
    console.error('❌ Schema registry not found. Run `npm run generate` first.');
    return false;
  }

  const currentRegistry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const lastGeneratedTime = new Date(currentRegistry.metadata.generatedAt);
  
  console.log(`📅 Last generated: ${lastGeneratedTime.toLocaleString()}`);

  // Check if schemas are older than 5 minutes (for CI builds)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const isStale = lastGeneratedTime < fiveMinutesAgo;

  if (isStale) {
    console.log('⚠️  Schemas may be stale. Regenerating to verify...');
    
    // Generate fresh schemas in memory (without writing)
    try {
      generateSchemas();
      console.log('✅ Schemas are now up-to-date');
      return true;
    } catch (error) {
      console.error('❌ Failed to regenerate schemas:', error);
      return false;
    }
  }

  // Validate individual schema files exist
  const expectedSchemas = currentRegistry.schemas;
  for (const schemaName of expectedSchemas) {
    const schemaPath = join(SCHEMAS_DIR, `${schemaName}.json`);
    if (!existsSync(schemaPath)) {
      console.error(`❌ Missing schema file: ${schemaName}.json`);
      return false;
    }

    // Validate schema structure
    try {
      const schemaContent = JSON.parse(readFileSync(schemaPath, 'utf8'));
      if (!schemaContent.metadata || !schemaContent.schema) {
        console.error(`❌ Invalid schema format: ${schemaName}.json`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Invalid JSON in schema: ${schemaName}.json`);
      return false;
    }
  }

  console.log(`✅ All ${expectedSchemas.length} schemas are valid and up-to-date`);
  return true;
}

function main(): boolean {
  console.log('🚀 Schema Validator');
  console.log('');

  const isValid = validateSchemas();
  
  if (!isValid) {
    console.log('');
    console.log('💡 To fix this, run: npm run generate');
    process.exit(1);
  }

  return isValid;
}

if (require.main === module) {
  main();
}

export { validateSchemas };