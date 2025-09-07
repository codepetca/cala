# ADR 0003: Use Convex for Realtime Persistence

## Status
Accepted

## Context
The trip planner app requires real-time collaboration: users should see updates (e.g., new events, rescheduled items) instantly without manual refresh. Options considered include Convex, Supabase, Firebase, or building a custom backend with Postgres + WebSockets.

## Decision
Adopt **Convex** as the backend for persistence, auth, and real-time data sync.

- Store all domain objects (trips, events, users) in Convex tables.  
- Define schema in `convex/schema.ts` mirroring Zod domain models.  
- Use Convex queries for reactive subscriptions.  
- Use Convex mutations for writes with optimistic updates.  
- Integrate Convex Auth for identity and membership enforcement.  

## Consequences

### Positive
- Automatic real-time sync across clients.  
- No WebSocket or caching boilerplate.  
- Strong TypeScript support with generated client APIs.  
- Simple developer experience, especially for small teams and AI agents.  

### Negative
- Vendor lock-in to Convex.  
- Limited query flexibility compared to SQL.  
- Smaller ecosystem compared to Firebase/Supabase.  

## Alternatives Considered
- **Supabase**: More SQL flexibility, weaker realtime and optimistic updates.  
- **Firebase**: Mature ecosystem, but less type-safe and harder relational modeling.  
- **Custom backend (Postgres + WebSockets + Redis)**: Maximum control, but significantly more complexity to build and maintain.  