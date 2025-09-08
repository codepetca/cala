# Domain Glossary & Business Rules

## Core Entities

### User
- Individual person using the application
- Has name, email (unique identifier)
- Can be member of multiple workspaces
- Created automatically on first sign-in

### Workspace  
- Collaboration boundary for organizing plans
- Owned by a single user
- Can have multiple members with different roles
- Automatically created when user signs up

### Membership
- Relationship between User and Workspace
- Defines role: `owner`, `editor`, or `viewer`
- Enforces permissions for workspace actions

### Plan
- Trip planning document within a workspace
- Has name, creation date, and optional public sharing
- Contains multiple items (scheduled and unscheduled)
- Can be made public via unique share slug

### Item
- Individual task/activity within a plan
- Has title (required) and optional notes
- May be **scheduled** (has start/end dates) or **unscheduled** (no dates)
- Timestamps track creation and last modification

## Business Rules & Invariants

### Scheduling Rules
1. **Unscheduled items are valid**: Items without start dates are first-class citizens
2. **End ≥ Start**: If both dates are set, end must be same day or later than start
3. **UTC storage**: All timestamps stored in UTC, displayed in user's local timezone
4. **Optional dates**: Start and end dates are both optional and independent

### Access Control
1. **Workspace membership required**: Only workspace members can read/write plans
2. **Role hierarchy**: `owner` > `editor` > `viewer` for permissions
3. **Public sharing**: Public plans readable by anyone with share link (no auth required)
4. **Owner privileges**: Only workspace owners can delete plans and manage members

### Data Consistency
1. **Cascading deletes**: Deleting plan removes all associated items
2. **Workspace isolation**: Plans and items scoped to workspace boundaries
3. **Audit trail**: Creation and update timestamps on all entities
4. **Share slug uniqueness**: Each plan gets unique share slug for public access

## State Transitions

### Item Lifecycle
```
Created (unscheduled) → Scheduled → Unscheduled → Deleted
                    ↗           ↘
                Scheduled → Modified → Scheduled
```

### Plan Sharing
```
Private Plan → Make Public → Public Plan (with share link)
           ↘              ↗
            Public Plan → Make Private → Private Plan
```

## Domain Language

**Scheduled**: An item with defined start date (and optionally end date)
**Unscheduled**: An item without any date constraints, used for brainstorming
**Workspace**: Collaboration boundary, like a "team" or "family" planning together  
**Share Link**: Public URL that allows read-only access to a plan
**Real-time**: Changes appear immediately across all connected clients
**Optimistic Update**: UI updates immediately, syncs with server afterward

## Business Constraints

### Performance Limits
- Maximum 100 characters for plan names and item titles
- No hard limit on number of items per plan (rely on pagination if needed)
- Share slugs are 10 characters (nanoid) for uniqueness

### User Experience Rules
- Default to unscheduled when creating items (dates are optional)
- Focus management in modals for accessibility
- Immediate visual feedback for all user actions
- Clear visual distinction between scheduled/unscheduled items

### Security Boundaries
- Public plans are truly read-only (no write access via share link)
- Workspace membership is required for all write operations
- Input validation at all API boundaries with Zod schemas
- No client-side auth state (rely on server-side identity)

## UI System Architecture

### Component Organization
- `@/components/ui/*` - shadcn/ui primitive components (Button, Card, Dialog, etc.)
- `@/components/app/*` - Application-specific components (AppShell, ThemeToggle, NavItems)
- `@/lib/utils.ts` - Utility functions including `cn()` for class merging

### UI Stack
- **TailwindCSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Copy-pasteable components built on Radix primitives
- **Radix UI**: Accessible, unstyled UI components
- **Lucide React**: Tree-shakable icon library
- **next-themes**: Dark/light theme management

### Development Rules
1. **Client Components Only**: Convex hooks (useQuery, useMutation) must be in components marked with `'use client'`
2. **Named Imports**: Always import Lucide icons by name (e.g., `import { Plus, Settings } from 'lucide-react'`)
3. **Accessibility First**: Use Radix primitives to ensure keyboard navigation and ARIA support
4. **Portal Z-Index**: Set `z-50` or higher on Dialog/Dropdown/Popover components for proper layering
5. **Theme Support**: All components should work in both light and dark modes

### Component Patterns
- Use `cn()` utility to merge Tailwind classes conditionally
- Implement loading states and error boundaries for Convex data
- Follow compound component patterns for complex UI elements
- Maintain consistent spacing with Tailwind space utilities

### Styling Guidelines
- Prefer Tailwind utilities over custom CSS
- Use design system colors (primary, secondary, muted, etc.) from theme
- Implement responsive design with mobile-first approach
- Maintain 4px grid system for consistent spacing