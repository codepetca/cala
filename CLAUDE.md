# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
pnpm install         # Install all dependencies
pnpm dev            # Start Next.js dev server + Convex sync
pnpm build          # Production build
pnpm lint           # ESLint + autofix
pnpm typecheck      # TypeScript strict checking
```

### Testing
```bash
pnpm test           # Run all unit/integration tests (Vitest)
pnpm test:watch     # Run tests in watch mode
pnpm test:e2e       # Run E2E tests (Playwright)

# Run specific tests
npx vitest convex/test/items.test.ts    # Single Convex function test
npx vitest tests/ItemEditor.test.tsx    # Single component test  
npx playwright test tests/e2e/tripPlanner.spec.ts  # Single E2E test
```

### Convex Backend
```bash
npx convex dev      # Start Convex development (run once per project)
npx convex deploy   # Deploy backend to production
npx convex dashboard # Open Convex admin dashboard
```

## Architecture Overview

### Tech Stack & Data Flow
- **Frontend**: Next.js App Router with Server Components by default
- **Backend**: Convex handles database, auth, real-time sync, and API functions
- **Data Flow**: React → Convex queries/mutations → Convex database → Real-time sync back to React

### Database Schema (Convex)
Core entity relationships:
```
Users → Memberships ← Workspaces → Plans → Items
         (roles)                   (scheduled/unscheduled)
```

Key tables:
- `users` - Authentication and profile data
- `workspaces` - Collaboration boundaries with ownership
- `memberships` - User-workspace relationships with roles (`owner`/`editor`/`viewer`)  
- `plans` - Trip plans with optional public sharing via `shareSlug`
- `items` - Plan items that can be scheduled (with dates) or unscheduled (no dates)

### Permission System
- **Workspace-scoped**: All data operations require workspace membership
- **Role hierarchy**: `owner` > `editor` > `viewer` for permissions
- **Public sharing**: Plans can be made public for read-only access via share links
- **Server-side enforcement**: All permission checks happen in Convex functions

### Component Architecture Patterns

**Server Components (default)**: All page components and non-interactive elements
**Client Components**: Only for forms, modals, and interactive UI requiring hooks

Key Client Components:
- `ItemEditor` - Modal for creating/editing items with date management
- `PlanView` - Main plan interface with scheduled/unscheduled item separation  
- `AuthButton` - Convex auth integration with magic link signin

## Development Workflow

### Adding New Features
1. **Start with Convex schema** (`convex/schema.ts`) - add tables/fields with proper indexes
2. **Create Convex functions** - queries for reads, mutations for writes, all with Zod validation
3. **Add permission checks** - use `requireWorkspaceMembership()` helper in mutations
4. **Write Convex tests** - test business logic and validation with `ConvexTestingHelper`
5. **Build React components** - Server Components first, Client Components only when needed
6. **Add component tests** - mock Convex hooks and test user interactions
7. **Create E2E tests** - test full user flows with Playwright

### Critical Patterns

**Input Validation**: All external inputs validated with Zod schemas at Convex boundaries
```typescript
const itemInput = z.object({
  title: z.string().min(1).max(100),
  start: z.number().optional(),
  end: z.number().optional(),
});
```

**Authentication**: Check auth in all mutations
```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error('Not authenticated');
```

**Permissions**: Enforce workspace membership in all functions
```typescript
await requireWorkspaceMembership(ctx, workspaceId, 'editor');
```

**Date Handling**: Store UTC, display local timezone using `date-fns-tz`

### Key Business Rules
- **Items can be unscheduled**: Items without start dates are valid and first-class
- **End ≥ Start**: When both dates set, end must be same day or later than start  
- **UTC timestamps**: All dates stored in UTC, converted to local timezone for display
- **Workspace isolation**: Plans and items are scoped to workspace boundaries
- **Public sharing**: Public plans accessible via share slug without authentication

### Styling System
- **Tailwind CSS** with custom component classes in `globals.css`
- **Component classes**: `.btn`, `.btn-primary`, `.card`, `.form-input`, `.form-label`
- **Accessibility**: Focus management, ARIA labels, semantic HTML structure

### Testing Strategy
- **Unit tests**: Convex functions, Zod validators (Vitest)
- **Component tests**: React components with mocked Convex hooks (React Testing Library)  
- **E2E tests**: Full user flows including auth, CRUD operations, real-time sync (Playwright)

## Domain Knowledge

**Scheduled vs Unscheduled Items**: Core concept where items can exist without dates for brainstorming, then be scheduled later by adding start/end dates.

**Real-time Collaboration**: All data changes sync immediately across browser tabs/users via Convex's built-in real-time system.

**Role-based Access**: Three-tier permission system (owner/editor/viewer) enforced server-side in all Convex functions.

See `docs/DOMAIN.md` for complete business rules and `docs/AI_GUIDE.md` for detailed development patterns.