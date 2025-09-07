# ADR 0001: Architecture Overview

## Status
Accepted

## Context
The Trip Planner application is a real-time collaborative tool. To balance simplicity, developer experience, and performance, several key architectural decisions were made at project inception.  

This ADR serves as an **umbrella overview**. Each major decision has been broken out into its own ADR for traceability and future evolution. ADR 0001 will not be superseded directly but will remain as a high-level reference.  

## Decisions (with References)
- [ADR 0002: Use Zod for Schema Validation](0002-use-zod-for-schemas.md)  
- [ADR 0003: Use Convex for Realtime Persistence](0003-use-convex-for-realtime.md)  
- [ADR 0004: Unscheduled Event Semantics](0004-unscheduled-event-semantics.md)  
- [ADR 0005: Next.js App Router with Server Components](0005-nextjs-app-router.md)  
- [ADR 0006: Tailwind CSS for Styling](0006-tailwind-css.md)  
- [ADR 0007: Convex Auth with Magic Links](0007-authentication.md)  
- [ADR 0008: Testing Strategy](0008-testing-strategy.md)  

## Notes
This ADR is not intended to be superseded. Instead, changes should be reflected in the **focused ADRs** that follow.

## Notes
This ADR is not intended to be superseded. Instead, changes should be reflected in the **focused ADRs** that follow (e.g., ADR 0002–0008). ADR 0001 should always provide an up-to-date map of the system’s architectural decisions.  

Domain concepts and business rules are documented separately in [domain.md](../domain.md).

### Frontend
- **Next.js App Router with Server Components**  
  - Server Components by default, Client Components only where interactivity is required.  
  - See: *ADR 0005 (to be written)*  

### Backend
- **Convex for Data Layer and Realtime**  
  - Unified backend for persistence, auth, and real-time queries.  
  - See: [ADR 0003: Use Convex for Realtime Persistence](0003-use-convex-for-realtime.md)  

- **Zod for Schema Validation**  
  - Shared domain models across client and server.  
  - See: [ADR 0002: Use Zod for Schema Validation](0002-use-zod-for-schemas.md)  

### Domain Model
- **Unscheduled Events**  
  - Introduced as a first-class event type for backlog items without dates.  
  - See: [ADR 0004: Unscheduled Event Semantics](0004-unscheduled-event-semantics.md)  

### State Management
- Convex reactive queries; no additional client-side state library required.  

### UI
- Tailwind CSS with utility-first classes and component patterns.  
- Accessibility: WCAG 2.1 AA baseline.  

### Authentication
- Convex Auth with magic links for simple onboarding.  

### Testing
- Multi-layer testing:  
  - Unit (Vitest)  
  - Component (React Testing Library)  
  - E2E (Playwright)  

### Deployment
- Frontend on Vercel (edge network).  
- Backend on Convex infrastructure.  

## Consequences

### Positive
- Rapid development with minimal boilerplate.  
- Built-in real-time collaboration.  
- Strong type safety and schema-first design.  
- Excellent developer experience for small teams and AI agents.  

### Negative
- Vendor lock-in to Convex.  
- Some learning curve for developers new to Convex.  
- Limited flexibility in auth flows.  

## Notes
This ADR is not intended to be superseded. Instead, changes should be reflected in the **focused ADRs** that follow (e.g., ADR 0002–0004). ADR 0001 should always provide an up-to-date map of the system’s architectural decisions.  