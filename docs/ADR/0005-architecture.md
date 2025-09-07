# ADR 0005: Next.js App Router with Server Components

## Status
Accepted

## Context
The frontend must be fast, SEO-friendly, and easy to maintain. Alternatives: SvelteKit, Remix, traditional React SPA.

## Decision
Adopt **Next.js App Router** with **Server Components by default**.

- Use Client Components only for interactivity (e.g., drag/drop, forms)  
- Co-locate routes under `/app` with file-system routing  
- Pass data via props rather than client-side fetches  

## Consequences
### Positive
- Strong SEO support  
- Reduced bundle size  
- Clean separation of server vs. client logic  

### Negative
- Learning curve for App Router model  
- Less ecosystem maturity than older Next.js patterns  

## Alternatives Considered
- SvelteKit: good DX, but smaller ecosystem  
- Remix: strong data model, weaker tooling support for AI agents  
- Plain React SPA: worse SEO, more boilerplate