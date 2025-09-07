# ADR 0006: Tailwind CSS for Styling

## Status
Accepted

## Context
We need fast, consistent UI styling with accessibility support. Alternatives: CSS Modules, Styled Components, Vanilla Extract.

## Decision
Adopt **Tailwind CSS** with utility-first classes and custom component classes.

- Use shared classes for buttons, cards, inputs  
- Follow accessible color and spacing defaults  
- No runtime CSS-in-JS  

## Consequences
### Positive
- Rapid iteration speed  
- Consistent design system  
- Low runtime overhead  

### Negative
- Verbose class strings  
- Requires discipline to avoid “utility soup”  

## Alternatives Considered
- CSS Modules: scoped, but less ergonomic  
- Styled Components: powerful, but adds runtime cost  
- Vanilla Extract: type-safe, less familiar to contributors