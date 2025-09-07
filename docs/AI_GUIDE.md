# AI Development Guide

Guidelines for AI assistants working on this Trip Planner codebase.

## Relationship to ADRs

This guide defines conventions and patterns for day-to-day development.  
For **major architectural choices**, refer to the Architecture Decision Records (in `/docs/ADR`).  

- [ADR 0001: Architecture Overview](./ADR/0001-architecture-overview.md)  
- [ADR 0002: Use Zod for Schema Validation](./ADR/0002-use-zod-for-schemas.md)  
- [ADR 0003: Use Convex for Realtime Persistence](./ADR/0003-use-convex-for-realtime.md)  
- [ADR 0004: Unscheduled Event Semantics](./ADR/0004-unscheduled-event-semantics.md)  

When in doubt:  
- **Follow ADRs first** (they capture the “why”).  
- **Follow this guide second** (it captures the “how”).  

## Relationship to Domain Glossary

This guide covers implementation conventions.  
For the meaning of domain entities (User, Workspace, Plan, Item) and business rules, see [Domain Glossary & Business Rules](./domain.md).  

---

## Code Organization Principles

### File Structure Patterns
```
/app                 # Next.js App Router pages and layouts
  /components       # Reusable React components
  /[route]         # Dynamic routes
/convex             # Backend functions and schema
  /test            # Convex function tests
/tests              # Frontend tests
  /e2e             # Playwright E2E tests
/docs               # Documentation
  /ADR             # Architecture Decision Records
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ItemEditor`, `PlanView`)
- **Functions**: camelCase (e.g., `createItem`, `validatePermissions`)
- **Files**: kebab-case for utilities, PascalCase for components
- **Database**: snake_case would be used for SQL, but Convex uses camelCase
- **Constants**: SCREAMING_SNAKE_CASE

## How to Add Features

### 1. Data Layer Changes
Always start with the schema and data layer:

1. **Update Convex Schema** (`convex/schema.ts`)
   - Add new tables or fields as needed
   - Include proper indexes for query performance
   - Use Convex's validation system

2. **Create/Update Convex Functions**
   - Add queries for reading data
   - Add mutations for writing data  
   - Include Zod validation for all inputs
   - Enforce permissions with workspace membership checks

3. **Write Tests**
   - Test new Convex functions with `ConvexTestingHelper`
   - Test input validation with separate Zod tests
   - Ensure error cases are covered

### 2. Frontend Changes

1. **Server Components First**
   - Use Server Components by default for performance
   - Only use Client Components when interactivity is needed
   - Pass data down as props rather than fetching in Client Components

2. **Add Client Components**
   - Use `'use client'` directive when needed
   - Import from `convex/react` for `useQuery`, `useMutation`
   - Follow existing patterns for error handling and loading states

3. **Component Testing**
   - Mock Convex hooks in component tests
   - Test user interactions with React Testing Library
   - Focus on behavior, not implementation details

### 3. Integration & E2E
1. **Add E2E Tests** for new user flows
2. **Update existing tests** if behavior changes
3. **Test accessibility** with screen readers in mind

## Code Patterns to Follow

### Convex Functions
```typescript
export const myMutation = mutation({
  args: { id: v.id('table'), name: v.string() },
  handler: async (ctx, args) => {
    // 1. Validate input with Zod
    const input = myInputSchema.parse(args);
    
    // 2. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    // 3. Check permissions
    await requireWorkspaceMembership(ctx, workspaceId, 'editor');
    
    // 4. Business logic
    const result = await ctx.db.patch(args.id, { name: args.name });
    
    return result;
  },
});
```

### React Components
```typescript
'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

export default function MyComponent({ id }: { id: Id<'table'> }) {
  const data = useQuery(api.myModule.getData, { id });
  const updateData = useMutation(api.myModule.updateData);

  if (!data) return <div>Loading...</div>;

  const handleUpdate = async () => {
    try {
      await updateData({ id, ...newData });
    } catch (error) {
      console.error('Update failed:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="card p-4">
      {/* Component content */}
    </div>
  );
}
```

### Error Handling
- Use try/catch in mutation calls
- Show user-friendly error messages
- Log errors for debugging but don't expose internals
- Validate all inputs with Zod schemas

### Styling
- Use Tailwind utility classes
- Follow established component classes (`.btn`, `.card`, `.form-input`)
- Maintain consistent spacing and typography
- Ensure accessibility with proper contrast and focus states

## Change Checklist

When making changes, ensure:

### Code Quality
- [ ] TypeScript strict mode passes with no `any` types
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] All imports are used and properly organized

### Functionality  
- [ ] Input validation with Zod schemas
- [ ] Authentication/authorization checks
- [ ] Error handling with user feedback
- [ ] Loading states for async operations

### Testing
- [ ] Unit tests for new functions
- [ ] Component tests for UI changes
- [ ] E2E tests for new user flows
- [ ] All tests passing

### Accessibility
- [ ] Proper ARIA labels and roles
- [ ] Keyboard navigation support
- [ ] Focus management in modals
- [ ] Semantic HTML structure

### Performance
- [ ] Server Components used where possible
- [ ] Efficient database queries with proper indexes
- [ ] No unnecessary re-renders
- [ ] Images optimized if added

## Common Pitfalls to Avoid

1. **Using `any` types** - Always define proper types
2. **Client-side data fetching** - Use Server Components when possible
3. **Missing input validation** - Always validate with Zod
4. **Ignoring permissions** - Check workspace membership
5. **Poor error handling** - Provide user-friendly messages
6. **Accessibility oversights** - Test with keyboard and screen readers
7. **Inconsistent styling** - Follow established Tailwind patterns

## Testing Philosophy

- **Unit Tests**: Fast, isolated tests for business logic
- **Integration Tests**: Test components with mocked dependencies  
- **E2E Tests**: Full user flows in real browser environment
- **Manual Testing**: Accessibility, edge cases, error scenarios

## Performance Considerations

- Use Server Components to reduce JavaScript bundle size
- Implement proper loading states to improve perceived performance
- Consider pagination for large lists (not implemented in v1)
- Optimize images and assets
- Use Convex's built-in caching and real-time optimizations

## Security Mindset

- Never trust client-side data
- Validate all inputs on the server
- Check permissions for every operation
- Use parameterized queries (Convex handles this)
- Don't log sensitive information
- Follow principle of least privilege for roles

## When to Break These Rules

These guidelines optimize for maintainability and consistency. Break them when:
- Performance critical code requires optimization
- Third-party integrations have different patterns
- Accessibility requires custom implementations
- User experience demands exceptions

Always document why you're deviating from established patterns.