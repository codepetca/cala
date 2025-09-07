/**
 * Schema Helpers Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  loadSchema,
  loadSchemaRegistry,
  getAvailableSchemas,
  getSchemasByCategory,
  getEventSchemas,
  getCoreSchemas,
  getSchemaMetadata,
  schemaExists,
  getJSONSchema,
  getSchemaSummary,
  formatSchemaForPrompt,
  getSchemaValidationRules,
} from '../utils/schema-helpers';

describe('Schema Helpers', () => {
  beforeAll(async () => {
    // Ensure schemas are generated before tests
    const { generateSchemas } = await import('../generate-schemas');
    generateSchemas();
  });

  describe('loadSchema', () => {
    it('should load existing schema', () => {
      const schema = loadSchema('TripEvent');
      
      expect(schema).toBeTruthy();
      expect(schema!.metadata.name).toBe('TripEvent');
      expect(schema!.schema).toBeTruthy();
    });

    it('should return null for non-existent schema', () => {
      const schema = loadSchema('NonExistentSchema');
      expect(schema).toBeNull();
    });
  });

  describe('loadSchemaRegistry', () => {
    it('should load schema registry', () => {
      const registry = loadSchemaRegistry();
      
      expect(registry).toBeTruthy();
      expect(registry!.schemas).toBeInstanceOf(Array);
      expect(registry!.schemas.length).toBeGreaterThan(0);
      expect(registry!.schemasByCategory).toBeTruthy();
    });
  });

  describe('getAvailableSchemas', () => {
    it('should return array of schema names', () => {
      const schemas = getAvailableSchemas();
      
      expect(schemas).toBeInstanceOf(Array);
      expect(schemas).toContain('TripEvent');
      expect(schemas).toContain('Trip');
      expect(schemas).toContain('User');
    });
  });

  describe('getSchemasByCategory', () => {
    it('should return event schemas', () => {
      const eventSchemas = getSchemasByCategory('events');
      
      expect(eventSchemas).toBeInstanceOf(Array);
      expect(eventSchemas).toContain('TripEvent');
      expect(eventSchemas).toContain('UnscheduledEvent');
    });

    it('should return core schemas', () => {
      const coreSchemas = getSchemasByCategory('core');
      
      expect(coreSchemas).toBeInstanceOf(Array);
      expect(coreSchemas).toContain('Trip');
      expect(coreSchemas).toContain('User');
    });
  });

  describe('getEventSchemas', () => {
    it('should return event schemas', () => {
      const eventSchemas = getEventSchemas();
      
      expect(eventSchemas).toContain('TripEvent');
      expect(eventSchemas).toContain('AllDayEvent');
      expect(eventSchemas).toContain('TimedEvent');
    });
  });

  describe('getCoreSchemas', () => {
    it('should return core schemas', () => {
      const coreSchemas = getCoreSchemas();
      
      expect(coreSchemas).toContain('Trip');
      expect(coreSchemas).toContain('User');
      expect(coreSchemas).toContain('Workspace');
    });
  });

  describe('getSchemaMetadata', () => {
    it('should return metadata for existing schema', () => {
      const metadata = getSchemaMetadata('TripEvent');
      
      expect(metadata).toBeTruthy();
      expect(metadata!.name).toBe('TripEvent');
      expect(metadata!.version).toBe('1.0.0');
      expect(metadata!.description).toContain('trip event');
    });

    it('should return null for non-existent schema', () => {
      const metadata = getSchemaMetadata('NonExistent');
      expect(metadata).toBeNull();
    });
  });

  describe('schemaExists', () => {
    it('should return true for existing schema', () => {
      expect(schemaExists('TripEvent')).toBe(true);
    });

    it('should return false for non-existent schema', () => {
      expect(schemaExists('NonExistent')).toBe(false);
    });
  });

  describe('getJSONSchema', () => {
    it('should return JSON schema definition', () => {
      const jsonSchema = getJSONSchema('TripEvent');
      
      expect(jsonSchema).toBeTruthy();
      expect(jsonSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    });

    it('should return null for non-existent schema', () => {
      const jsonSchema = getJSONSchema('NonExistent');
      expect(jsonSchema).toBeNull();
    });
  });

  describe('getSchemaSummary', () => {
    it('should return schema summary', () => {
      const summary = getSchemaSummary('TripEvent');
      
      expect(summary).toBeTruthy();
      expect(summary!.name).toBe('TripEvent');
      expect(summary!.hasRequired).toBe(true);
      expect(summary!.requiredFields).toContain('id');
      expect(summary!.lastGenerated).toBeInstanceOf(Date);
    });
  });

  describe('formatSchemaForPrompt', () => {
    it('should format schema for AI prompt', () => {
      const prompt = formatSchemaForPrompt('UnscheduledEvent');
      
      expect(prompt).toContain('## UnscheduledEvent Schema');
      expect(prompt).toContain('```json');
      expect(prompt).toContain('unscheduled');
    });

    it('should handle non-existent schema', () => {
      const prompt = formatSchemaForPrompt('NonExistent');
      expect(prompt).toContain('not found');
    });
  });

  describe('getSchemaValidationRules', () => {
    it('should return validation rules for discriminated union', () => {
      const rules = getSchemaValidationRules('TripEvent');
      
      expect(rules).toBeInstanceOf(Array);
      expect(rules.some(rule => rule.includes('discriminated union'))).toBe(true);
      expect(rules.some(rule => rule.includes('Required fields'))).toBe(true);
    });

    it('should return empty array for non-existent schema', () => {
      const rules = getSchemaValidationRules('NonExistent');
      expect(rules).toEqual([]);
    });
  });
});