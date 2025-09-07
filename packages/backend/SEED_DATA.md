# Seed Data Management

## Overview

The Trip Planner application includes comprehensive seed data to support development and testing. This seed data creates a demo workspace with a public trip that showcases all features of the application.

## Demo Data Structure

### Demo Trip: "Japan 2026"
- **Share Slug**: `demo-japan-2026`
- **Public Access**: Available at `/share/demo-japan-2026`
- **Description**: "Two-week adventure exploring Tokyo, Mount Fuji, and Kyoto"
- **Created by**: Demo User (demo@example.com)
- **Workspace**: Demo Workspace

### Comprehensive Event Examples

The demo trip includes 6 different events showcasing all event types:

#### Unscheduled Events (2)
1. **"Book flights to Tokyo"**
   - Notes: "Check ANA, JAL, and United for best prices"
   - Status: Pending/backlog item

2. **"Research accommodations"**
   - Notes: "Look into ryokans vs hotels in different districts"
   - Status: Pending/backlog item

#### All-Day Events (3)
3. **"Tokyo arrival and city exploration"** (3-day event)
   - Notes: "Shibuya, Harajuku, Tsukiji market"
   - Duration: Multi-day experience

4. **"Mount Fuji day trip"** (single day)
   - Notes: "Weather dependent - have backup indoor activities"
   - Duration: Single day adventure

5. **"Kyoto temples and gardens"** (3-day event)
   - Notes: "Kinkaku-ji, Fushimi Inari, bamboo grove"
   - Duration: Multi-day cultural exploration

#### Timed Event (1)
6. **"Flight departure to Tokyo"**
   - Notes: "Gate opens 2 hours early, arrive at airport 3 hours before"
   - Time: Specific flight schedule with timezone handling

## Running Seed Data

### Development Environment
To seed your development database with demo data:

```bash
npx convex run seed:seed
```

This will create:
- Demo user and workspace
- Public "Japan 2026" trip with shareSlug `demo-japan-2026`
- 6 diverse trip events (unscheduled, all-day, and timed)

### Verification
Verify the seed data was created successfully:

```bash
# Check if trip exists and is public
npx convex run trips:getTripByShareSlug '{"shareSlug": "demo-japan-2026"}'

# Check if events were created
npx convex run tripEvents:getTripEventsPublic '{"shareSlug": "demo-japan-2026"}'
```

### E2E Testing
The seed data supports the E2E test suite, specifically:
- **Public Share Page Test**: Verifies `/share/demo-japan-2026` loads correctly
- **Event Type Coverage**: Tests all discriminated union event types
- **Public Sharing**: Confirms public trips work without authentication

## Database Schema Integration

The seed data is designed to work with the Zod schema-first approach:

### Schemas Used
- **Trip Schema**: `/packages/domain/src/schemas/trip.ts`
- **TripEvent Schema**: `/packages/domain/src/schemas/trip-event.ts`  
- **Workspace Schema**: `/packages/domain/src/schemas/workspace.ts`
- **User Schema**: `/packages/domain/src/schemas/user.ts`

### Event Type Coverage
The seed data demonstrates all three event kinds from the discriminated union:

```typescript
// Unscheduled: No timing information
{ kind: 'unscheduled', title: '...', notes: '...' }

// All-day: Date-based scheduling
{ kind: 'allDay', startDate: Date, endDate?: Date }

// Timed: Precise date-time scheduling  
{ kind: 'timed', startDateTime: Date, endDateTime: Date }
```

## Architecture Considerations

### Public Sharing
- Demo trip has `isPublic: true` and a predictable `shareSlug`
- Public trips can be accessed without authentication
- ShareView component handles loading states properly

### Data Consistency
- All events reference the same `tripId`
- Trip belongs to demo workspace with proper membership
- Timestamps use consistent Date.now() values

### Frontend Integration
- ShareView component at `/packages/web/app/components/ShareView.tsx`
- Public route at `/packages/web/app/share/[shareSlug]/page.tsx`
- Conditional header hides "Trip Planner" branding on share pages

## Troubleshooting

### Common Issues

1. **"Trip Not Found" Error**
   - Ensure seed data has been run: `npx convex run seed:seed`
   - Verify trip is public: Check `isPublic: true` in database
   - Confirm shareSlug exists: `demo-japan-2026`

2. **E2E Test Failures**
   - Multiple H1 elements: Fixed with ConditionalHeader component
   - Loading states: ShareView now properly handles undefined vs null
   - Race conditions: Improved query handling in React components

3. **Data Persistence**
   - Seed data persists across development sessions
   - Safe to run seed command multiple times (creates new instances)
   - Use Convex dashboard to inspect/clear data if needed

### Development Commands

```bash
# View all trips in database
npx convex run convex data trips

# View specific trip data
npx convex run trips:getTripByShareSlug '{"shareSlug": "demo-japan-2026"}'

# View trip events
npx convex run tripEvents:getTripEventsPublic '{"shareSlug": "demo-japan-2026"}'

# Re-seed database (creates new demo data)
npx convex run seed:seed
```

## Security Notes

- Demo data uses predictable identifiers for testing
- Public sharing is intentionally enabled for the demo trip
- Production environments should use different seed strategies
- Demo user email (`demo@example.com`) is not a real account