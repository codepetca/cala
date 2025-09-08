# Trip Planner

A real-time collaborative trip planning app built with Next.js App Router, Convex, and strict TypeScript.

## Features

- **Authentication**: Simple magic link auth via Convex
- **Workspaces**: Multi-user collaboration with role-based permissions
- **Plans**: Create trip plans within workspaces
- **Items**: Add scheduled (with dates) or unscheduled items to plans
- **Real-time Updates**: All changes sync live across clients
- **Public Sharing**: Share plans via read-only public links
- **Responsive UI**: Clean, accessible interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Convex for database, auth, and real-time sync
- **Styling**: Tailwind CSS + shadcn/ui + Radix UI primitives
- **Validation**: Zod for input validation
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel (frontend) + Convex (backend)

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Convex settings
   ```

3. **Start development**:
   ```bash
   pnpm dev
   ```

4. **Visit**: http://localhost:3000

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key
```

### Getting Convex Keys

1. Sign up at [convex.dev](https://convex.dev)
2. Create a new project
3. Run `npx convex dev` to set up authentication
4. Copy the generated URLs and keys to your `.env`

## Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production  
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript compiler
pnpm test         # Run unit tests (Vitest)
pnpm test:watch   # Run tests in watch mode
pnpm test:e2e     # Run E2E tests (Playwright)
```

### Database Schema

The app uses Convex with these main tables:
- `users` - User accounts
- `workspaces` - Collaboration spaces
- `memberships` - User-workspace relationships
- `plans` - Trip plans within workspaces  
- `items` - Individual plan items (scheduled/unscheduled)

### Key Patterns

- **Server Components** by default, Client Components for interactivity
- **Zod validation** at all API boundaries  
- **UTC storage** with local timezone display
- **Optimistic updates** via Convex reactivity
- **Role-based permissions** enforced server-side

## Frontend Conventions

### Component Structure

```
@/components/ui/*        # shadcn/ui primitives (Button, Card, Dialog)
@/components/app/*       # App-specific components (AppShell, ThemeToggle)
@/lib/utils.ts           # Utilities including cn() for class merging
```

### Import Patterns

```typescript
// ✅ Named icon imports (tree-shakable)
import { Plus, Calendar, Settings } from 'lucide-react'

// ✅ shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// ✅ Convex hooks in client components only
'use client'
import { useQuery, useMutation } from 'convex/react'
```

### Styling Guidelines

- **Tailwind First**: Use utility classes over custom CSS
- **Design System**: Use theme colors (`primary`, `secondary`, `muted`)
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Dark Mode**: All components support light/dark themes
- **Spacing**: 4px grid system with consistent space utilities

### Accessibility Rules

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **Portal Z-Index**: Use `z-50+` for modals, dropdowns, tooltips

### Component Examples

```typescript
// App Shell Usage
<AppShell>
  <YourPageContent />
</AppShell>

// Theme Toggle
<ThemeToggle />

// Modal with proper z-index
<Dialog>
  <DialogContent className="z-50">
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## Testing

### Unit & Integration Tests

```bash
pnpm test
```

Covers:
- Convex functions (queries/mutations)
- Zod validators  
- React components with mocked Convex

### E2E Tests  

```bash
pnpm test:e2e
```

Full user flows:
- Sign in and workspace creation
- Plan creation and management
- Item scheduling/unscheduling  
- Public sharing

## Deployment

### Vercel (Frontend)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Convex (Backend)

```bash
npx convex deploy
```

This deploys your schema, functions, and auth configuration.

### Production Checklist

- [ ] Environment variables set correctly
- [ ] Convex deployment successful
- [ ] All tests passing
- [ ] Build successful locally
- [ ] Domain configured (if custom)

## Architecture

See [docs/ADR/0001-architecture.md](docs/ADR/0001-architecture.md) for detailed architectural decisions.

### Key Design Principles

1. **Strict TypeScript** - No `any` types, comprehensive type safety
2. **Server/Client Boundaries** - Clear separation with RSC by default  
3. **Real-time First** - All data reactive via Convex
4. **Accessible UI** - WCAG compliant with proper focus management
5. **Defensive Validation** - Zod schemas at all boundaries

## Contributing

1. Run the full test suite before submitting PRs
2. Follow existing code patterns and naming conventions  
3. Add tests for new features
4. Update documentation as needed

## Domain Glossary

See [docs/DOMAIN.md](docs/DOMAIN.md) for business domain definitions and invariants.

## AI Development Guide  

See [docs/AI_GUIDE.md](docs/AI_GUIDE.md) for guidelines on extending this codebase with AI assistance.
