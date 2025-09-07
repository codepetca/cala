# ADR 0002: Use Zod for Schema Validation

## Status
Accepted

## Context
We need a single source of truth for validating and typing domain models (e.g., trips, events) across frontend and backend. Options include TypeScript types only, Yup, class-validator, or Zod.

## Decision
Adopt **Zod** as the schema library for all domain models.

- Use Zod schemas in the `domain/` package as the canonical definition.  
- Share schemas across frontend and backend via TypeScript imports.  
- Export types via `z.infer<typeof Schema>` for compile-time safety.  
- Generate JSON Schema from Zod (`zod-to-json-schema`) for testing and AI tool integration.  

## Consequences

### Positive
- Unified validation across client, server, and tests.  
- Runtime validation ensures safety at API boundaries.  
- Compile-time type inference reduces duplication.  
- Easy integration with Convex functions and AI assistants.  

### Negative
- Runtime validation adds small performance overhead.  
- Ties codebase to Zod’s syntax and features.  

## Alternatives Considered
- **TypeScript-only types**: No runtime validation, risk of invalid data.  
- **Yup**: Good validation, weaker type inference and ecosystem.  
- **class-validator**: Strong with decorators, less ergonomic in functional codebases.  