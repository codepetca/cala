#!/usr/bin/env node
/**
 * Schema Validation Tool
 *
 * Validates that generated JSON schemas are up-to-date with the source Zod schemas.
 * Fails the build if schemas are stale to prevent deployment with outdated schemas.
 */
declare function validateSchemas(): boolean;
export { validateSchemas };
//# sourceMappingURL=validate-schemas.d.ts.map