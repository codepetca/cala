# ADR 0008: Testing Strategy

## Status
Accepted

## Context
Reliability and confidence require multi-layer testing. Options: only unit tests, manual QA, heavier E2E focus.

## Decision
Adopt a **layered testing strategy**:

- **Unit tests** with Vitest for domain + Convex functions  
- **Component tests** with React Testing Library  
- **E2E tests** with Playwright for key user flows  
- Accessibility testing baked into E2E  

## Consequences
### Positive
- Confidence across layers  
- Fast iteration via unit tests  
- Realistic coverage via E2E  

### Negative
- More CI setup required  
- Potential overlap between test layers  

## Alternatives Considered
- Only unit tests: fast, but misses integration bugs  
- Only E2E: covers flows, but slow and brittle  
- Manual QA: not scalable, error-prone