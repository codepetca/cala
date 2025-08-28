# Cala - Trip Itinerary Planner

A frontend-only MVP of a sharable trip itinerary planner built with **SvelteKit 5**, **shadcn-svelte**, **Tailwind**, and **localStorage** for persistence.

## Features

✅ **Mobile-first responsive design**  
✅ **Light/Dark theme system** with toggle  
✅ **Drag & drop events** between days and unscheduled section  
✅ **Family-based event filtering** with color coding  
✅ **Event modal** for creating/editing event details  
✅ **localStorage persistence** - your data stays local  
✅ **Zod schema validation** for all data structures  
✅ **Touch-friendly drag & drop** on mobile devices  

## Event Types

- 🏨 **Stay** - Hotels, accommodation
- 🎯 **Activity** - Tours, attractions, experiences  
- 🍽️ **Meal** - Restaurants, dining reservations
- 🚗 **Transport** - Flights, car rentals, transfers
- 📝 **Note** - General notes and reminders

## Data Model

Built with **Zod** schemas for type safety:

- **Trip**: Contains name, dates, families, and events
- **Family**: Color-coded groups for filtering events
- **Event**: Draggable cards with time, type, and details

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Sample Data

On first load, the app creates a sample "Hawaii Family Vacation" with:
- Two sample families (Smith & Johnson)
- Various event types across multiple days
- Mix of scheduled and unscheduled events

## Architecture

- **SvelteKit 5** - App framework with runes
- **Tailwind CSS** - Utility-first styling
- **shadcn-svelte** - Component library  
- **svelte-dnd-action** - Drag & drop functionality
- **Zod** - Runtime type validation
- **localStorage** - Client-side data persistence

## Mobile Support

- Responsive grid layout
- Touch-friendly drag & drop
- Collapsible navigation
- Optimized for phone/tablet use

The app is designed mobile-first and works great on all screen sizes!

## Development

The app is running at http://localhost:5174/ - open it in your browser to see the trip planner in action!
