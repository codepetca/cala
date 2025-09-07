# ADR 0007: Authentication with Convex Magic Links

## Status
Accepted

## Context
We need simple, secure user onboarding. Options: email/password, OAuth, third-party identity providers.

## Decision
Use **Convex Auth with magic links**.

- Users sign in via email link (passwordless)  
- Handles email verification automatically  
- Roles stored in Convex tables (owner, editor, viewer)  

## Consequences
### Positive
- Very low friction for onboarding  
- No password management required  
- Good default security posture  

### Negative
- Users must check email each login  
- Limited customization vs. full auth systems  

## Alternatives Considered
- Email/password: more friction, worse DX  
- OAuth: good for enterprise, overkill for MVP  
- Clerk/Auth0: powerful, but adds complexity and cost