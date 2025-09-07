/**
 * Build Pipeline Integration Tests
 * 
 * Tests that AI schema generation is properly integrated with the monorepo build pipeline
 * and that all packages can successfully build with up-to-date schemas.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = '/Users/stew/Repos/vibe/cala';
const AI_PACKAGE_DIR = join(ROOT_DIR, 'packages/ai');
const SCHEMAS_DIR = join(AI_PACKAGE_DIR, 'src/schemas');

describe('Build Pipeline Integration', () => {
  beforeAll(() => {
    // Ensure we start with a clean state
    process.chdir(AI_PACKAGE_DIR);
  });

  describe('Schema Generation', () => {
    it('should generate schemas automatically during AI package build', () => {
      // Build the AI package (which should auto-generate schemas)
      const buildOutput = execSync('npm run build', { 
        cwd: AI_PACKAGE_DIR,
        encoding: 'utf-8'
      });

      expect(buildOutput).toContain('Generated');
      expect(buildOutput).toContain('schemas successfully');

      // Verify schema files exist
      expect(existsSync(join(SCHEMAS_DIR, 'TripEvent.json'))).toBe(true);
      expect(existsSync(join(SCHEMAS_DIR, 'Trip.json'))).toBe(true);
      expect(existsSync(join(SCHEMAS_DIR, 'index.json'))).toBe(true);
    });

    it('should generate schemas with correct metadata structure', () => {
      const tripEventSchema = JSON.parse(
        readFileSync(join(SCHEMAS_DIR, 'TripEvent.json'), 'utf-8')
      );

      expect(tripEventSchema).toHaveProperty('metadata');
      expect(tripEventSchema).toHaveProperty('schema');
      
      expect(tripEventSchema.metadata).toMatchObject({
        name: 'TripEvent',
        description: expect.any(String),
        version: '1.0.0',
        generatedAt: expect.any(String),
        sourceSchema: expect.stringContaining('@trip-planner/domain'),
      });

      expect(tripEventSchema.schema).toHaveProperty('definitions');
      expect(tripEventSchema.schema.definitions.TripEvent).toHaveProperty('anyOf');
      expect(tripEventSchema.schema.definitions.TripEvent.anyOf).toHaveLength(3); // unscheduled, allDay, timed
    });

    it('should generate schema registry with correct categorization', () => {
      const registry = JSON.parse(
        readFileSync(join(SCHEMAS_DIR, 'index.json'), 'utf-8')
      );

      expect(registry).toHaveProperty('metadata');
      expect(registry).toHaveProperty('schemas');
      expect(registry).toHaveProperty('schemasByCategory');

      expect(registry.schemasByCategory.events).toContain('TripEvent');
      expect(registry.schemasByCategory.events).toContain('UnscheduledEvent');
      expect(registry.schemasByCategory.events).toContain('AllDayEvent');
      expect(registry.schemasByCategory.events).toContain('TimedEvent');

      expect(registry.schemasByCategory.core).toContain('Trip');
      expect(registry.schemasByCategory.core).toContain('User');
      expect(registry.schemasByCategory.core).toContain('Workspace');
    });
  });

  describe('Build Artifacts', () => {
    it('should compile TypeScript successfully', () => {
      const distDir = join(AI_PACKAGE_DIR, 'dist');
      
      // Check that key files are compiled
      expect(existsSync(join(distDir, 'index.js'))).toBe(true);
      expect(existsSync(join(distDir, 'index.d.ts'))).toBe(true);
      expect(existsSync(join(distDir, 'domain-bridge.js'))).toBe(true);
      expect(existsSync(join(distDir, 'domain-bridge.d.ts'))).toBe(true);
      expect(existsSync(join(distDir, 'generate-schemas.js'))).toBe(true);
      expect(existsSync(join(distDir, 'utils/schema-helpers.js'))).toBe(true);
    });

    it('should export correct API from built package', () => {
      // Test that the built package can be imported and used
      const builtPackage = require(join(AI_PACKAGE_DIR, 'dist/index.js'));
      
      expect(builtPackage).toHaveProperty('generateSchemas');
      expect(builtPackage).toHaveProperty('AIEventOperations');
      expect(builtPackage).toHaveProperty('AISchemaUtils');
      expect(builtPackage).toHaveProperty('loadSchema');
      expect(builtPackage).toHaveProperty('getAvailableSchemas');

      expect(typeof builtPackage.generateSchemas).toBe('function');
      expect(typeof builtPackage.AIEventOperations.validateEvent).toBe('function');
      expect(typeof builtPackage.loadSchema).toBe('function');
    });
  });

  describe('Schema Validation', () => {
    it('should pass schema validation checks', () => {
      const validationOutput = execSync('npm run validate-schemas', {
        cwd: AI_PACKAGE_DIR,
        encoding: 'utf-8'
      });

      expect(validationOutput).toContain('schemas are valid and up-to-date');
      expect(validationOutput).not.toContain('stale');
      expect(validationOutput).not.toContain('error');
    });
  });

  describe('Domain Package Integration', () => {
    it('should build domain package successfully', () => {
      const domainDir = join(ROOT_DIR, 'packages/domain');
      
      const buildOutput = execSync('npm run build', {
        cwd: domainDir,
        encoding: 'utf-8'
      });

      // Check that domain tests pass
      expect(existsSync(join(domainDir, 'dist'))).toBe(true);
    });

    it('should run domain tests successfully', () => {
      const domainDir = join(ROOT_DIR, 'packages/domain');
      
      const testOutput = execSync('npm test', {
        cwd: domainDir,
        encoding: 'utf-8'
      });

      expect(testOutput).toContain('passed');
      expect(testOutput).not.toContain('failed');
    });
  });

  describe('Backend Package Integration', () => {
    it('should typecheck backend functions successfully', () => {
      const backendDir = join(ROOT_DIR, 'packages/backend');
      
      const typecheckOutput = execSync('npm run typecheck', {
        cwd: backendDir,
        encoding: 'utf-8'
      });

      expect(typecheckOutput).toContain('Typecheck passed');
      expect(typecheckOutput).not.toContain('error');
    });
  });

  describe('Cross-Package Dependencies', () => {
    it('should resolve workspace dependencies correctly', () => {
      // Test that AI package can import from domain package
      const { TripEventSchema } = require('@trip-planner/domain/src/schemas/trip-event');
      const { scheduleAsAllDay } = require('@trip-planner/domain/src/functions/event-scheduling');

      expect(TripEventSchema).toBeDefined();
      expect(typeof scheduleAsAllDay).toBe('function');
    });

    it('should work with AI domain bridge', () => {
      const { AIEventOperations } = require(join(AI_PACKAGE_DIR, 'dist/index.js'));

      const mockEvent = {
        id: 'test-event',
        tripId: 'test-trip',
        title: 'Test Event',
        notes: 'Test notes',
        kind: 'unscheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = AIEventOperations.validateEvent(mockEvent);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(mockEvent);
    });
  });

  describe('Watch Mode', () => {
    it('should provide watch mode for development', () => {
      // Test that the generate:watch script exists and is configured
      const packageJson = JSON.parse(
        readFileSync(join(AI_PACKAGE_DIR, 'package.json'), 'utf-8')
      );

      expect(packageJson.scripts).toHaveProperty('generate:watch');
      expect(packageJson.scripts['generate:watch']).toContain('--watch');
      expect(packageJson.devDependencies).toHaveProperty('concurrently');
    });
  });
});