# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development (Monorepo)
```bash
pnpm install                 # Install all dependencies across packages
pnpm dev                     # Start all development servers (Next.js + Convex)
pnpm dev:web                 # Start only Next.js frontend
pnpm dev:convex              # Start only Convex backend

pnpm build                   # Build all packages for production
pnpm lint                    # ESLint + autofix across all packages  
pnpm typecheck               # TypeScript strict checking across monorepo
```

### Schema-First Development
```bash
pnpm generate:schemas        # Generate JSON schemas from Zod (AI package)
pnpm validate:schemas        # Validate schema consistency across packages
```

### Testing
```bash
pnpm test                    # Run all tests (unit/integration)
pnpm test:watch              # Run tests in watch mode
pnpm test:e2e                # Run E2E tests (Playwright)
pnpm test:integration        # Run integration tests only
pnpm ci:check                # Full CI pipeline (schemas + typecheck + test)

# Run specific tests
npx vitest tests/EventEditor.test.tsx                    # Single component test
npx playwright test tests/e2e/tripPlanner.spec.ts       # Single E2E test  
npx vitest tests/integration/domain-backend-integration.test.ts  # Integration test
```

### Backend Development
```bash
cd packages/backend
pnpm convex:dev              # Start Convex development server
pnpm convex:deploy           # Deploy backend to production  
npx convex dashboard         # Open Convex admin dashboard
npx convex run seed:seed     # Seed demo data for development
```

## Monorepo Architecture

### Package Structure
```
packages/
├── domain/          # Zod schemas & domain logic (source of truth)
├── backend/         # Convex serverless functions & database
├── ai/              # AI integration & automatic schema generation
└── web/             # Next.js frontend application
```

### Schema-First Data Flow
```
Domain (Zod) → AI (JSON Schema) → Backend (Convex) → Frontend (React)
     ↓              ↓                 ↓                ↓
   Types         AI Context      Validation        UI Types
```

**Critical Pattern**: Domain package defines ALL data structures using Zod. AI package automatically generates JSON schemas. Backend and frontend consume these schemas for validation and typing.

### Database Schema (Updated Architecture)

Core entity relationships:
```
Users → WorkspaceMemberships ← Workspaces → Trips → TripEvents
         (roles)                                    (discriminated unions)
```

Key tables:
- `users` - Authentication and profile data
- `workspaces` - Collaboration boundaries with ownership  
- `workspaceMemberships` - User-workspace relationships with roles (`owner`/`editor`/`viewer`)
- `trips` - Trip containers with optional public sharing via `shareSlug`
- `tripEvents` - **Discriminated union events** with three variants:
  - `unscheduled` - Brainstorming/backlog items (no dates)
  - `allDay` - Full-day events with `startDate`/`endDate`
  - `timed` - Precise events with `startDateTime`/`endDateTime`

### Trip Event Discriminated Unions

**Core Concept**: Events use discriminated unions based on `kind` field:

```typescript
type TripEvent = 
  | { kind: 'unscheduled'; title: string; notes?: string; }
  | { kind: 'allDay'; title: string; startDate: string; endDate?: string; }
  | { kind: 'timed'; title: string; startDateTime: string; endDateTime: string; }
```

**Business Logic**: Events can transition between types:
- `unscheduled` → `allDay` (add dates)
- `unscheduled` → `timed` (add precise times) 
- `allDay` → `timed` (add specific times)
- Any type → `unscheduled` (remove scheduling)

## Component Architecture

### Frontend Structure (packages/web/)
```
app/
├── components/
│   ├── EventEditor.tsx      # CRUD for trip events with discriminated unions
│   ├── TripView.tsx         # Main trip interface with event management
│   ├── TripList.tsx         # Trip listing and creation within workspaces
│   ├── ShareView.tsx        # Public trip sharing (read-only)
│   └── WorkspaceList.tsx    # Workspace management and selection
├── trips/[tripId]/          # Trip-specific pages
├── workspace/[workspaceId]/ # Workspace management pages
└── share/[shareSlug]/       # Public sharing pages
```

### Key Patterns

**Client vs Server Components**:
- Server Components (default): All pages, static content, data fetching
- Client Components (explicit): Forms, modals, real-time interactions, state management

**Component Conventions**:
```typescript
// Add data-testid for E2E testing
<form data-testid="create-trip-form">
  <input data-testid="trip-name-input" />
</form>

// Use discriminated unions properly
const handleEventKind = (event: TripEvent) => {
  switch (event.kind) {
    case 'unscheduled': return renderBacklog(event);
    case 'allDay': return renderAllDay(event);  
    case 'timed': return renderTimed(event);
  }
};
```

## Development Workflow

### Adding New Features

1. **Start with Domain Schema** (`packages/domain/src/schemas/`) - Define Zod schemas with proper validation
2. **Generate Schemas** (`pnpm generate:schemas`) - Auto-generate JSON schemas for AI
3. **Create Backend Functions** (`packages/backend/convex/`) - Implement queries/mutations with schema validation
4. **Build Frontend Components** (`packages/web/app/components/`) - Use generated types from domain
5. **Add Tests** - Unit tests for domain logic, integration tests for backend, E2E for user flows
6. **Validate Integration** (`pnpm ci:check`) - Ensure all packages work together

### Schema Evolution

**Important**: When modifying schemas in `packages/domain/`, run `pnpm generate:schemas` to update AI integration and ensure all packages stay in sync.

### Permission System

All data operations require workspace membership with role-based access:
- **owner** - Full CRUD + workspace management
- **editor** - CRUD on trips/events within workspace
- **viewer** - Read-only access to workspace content

**Implementation**: Use `requireWorkspaceMembership()` helper in all Convex mutations.

## Testing Strategy

### E2E Test Agent System

Located in `.claude/agents/` - specialized agents for handling test failures:
- **E2E Test Agent** - Coordinates test execution and issue analysis
- **Frontend Specialist** - Handles UI/component issues  
- **Backend Specialist** - Manages database and API issues

**Usage**: When E2E tests fail, check agent recommendations in test output.

### Test Coverage Areas
- **Domain Logic**: Zod schema validation and business rules
- **Backend Functions**: Convex queries/mutations with permission testing
- **Frontend Components**: React component behavior with mocked Convex
- **Integration**: Cross-package data flow and schema consistency
- **E2E**: Complete user journeys including real-time sync

## Domain Knowledge

### Core Business Concepts

**Unscheduled-First Design**: Events can exist without dates for brainstorming, then be scheduled later. This is a first-class concept, not a temporary state.

**Event State Transitions**: Events flow naturally from unscheduled → scheduled (all-day or timed) → back to unscheduled, supporting flexible trip planning workflows.

**Real-time Collaboration**: All changes sync immediately across clients via Convex's built-in reactivity. No additional WebSocket setup required.

**Workspace Isolation**: All data is scoped to workspaces with strict permission boundaries enforced server-side.

### Schema Integration Points

**Critical**: The domain package is the single source of truth. Backend Convex schemas and frontend TypeScript types are derived from domain Zod schemas. Never define schemas in multiple places.

**AI Integration**: JSON schemas are automatically generated for AI context. The AI package provides utilities for working with structured trip data in AI workflows.

## Styling & UI

- **Tailwind CSS** with custom component classes in `packages/web/app/globals.css`
- **Component Classes**: `.btn`, `.btn-primary`, `.card`, `.form-input`, `.form-textarea`, `.form-label`
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **Responsive**: Mobile-first design with responsive breakpoints