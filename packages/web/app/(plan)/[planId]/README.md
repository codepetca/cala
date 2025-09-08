# WeekBoard - Trip Planner Week View

A sophisticated drag-and-drop week view for trip planning with laptop/desktop-first design.

## Features

✅ **Drag & Drop Interface**
- Backlog → All-day lane (schedule as all-day event)
- Backlog → Time grid (schedule with specific times)  
- Day → Day (reschedule events)
- Day → Backlog (unschedule events)

✅ **Time Management** 
- Time grid with 30-minute snapping (Alt+drag for 5-minute precision)
- Resizable timed events with top/bottom handles
- Current time indicator during business hours (8 AM - 8 PM)

✅ **Accessibility**
- Full keyboard drag-and-drop support (Space/Arrow/Enter/Esc)
- Screen reader announcements for all drag operations
- Focus management and ARIA labels

✅ **Event Types**
- **Unscheduled**: Ideas and backlog items (blue cards)
- **All-day**: Full-day events (purple chips) 
- **Timed**: Events with specific start/end times (green blocks)

## Architecture

### Component Hierarchy
```
WeekBoard (DnD Context)
├── BacklogColumn (Sortable list)
│   └── SortableItemCard[]
├── DayColumn[] (7 days)
│   ├── AllDayLane (Horizontal sortable)
│   │   └── SortableChipCard[]
│   └── TimeGrid (Drop zones + positioned events)
│       └── TimedEventComponent[] (draggable + resizable)
```

### Data Flow
1. **Mock Provider** → React hooks → Components (Stage 1)
2. **Convex Integration** → Live queries/mutations → Components (Stage 2)

### Key Files

| File | Purpose |
|------|---------|
| `WeekBoard.tsx` | Main component with DnD context |
| `BacklogColumn.tsx` | Left sidebar with unscheduled items |
| `DayColumn.tsx` | Individual day with all-day + time grid |
| `TimeGrid.tsx` | Hour lines, drop zones, positioned events |
| `TimedEvent.tsx` | Draggable/resizable timed event blocks |
| `AllDayLane.tsx` | All-day event chips with overflow |
| `ItemCard.tsx` | Backlog item cards |
| `ChipCard.tsx` | All-day event chips |
| `timeMath.ts` | Time positioning and snapping utilities |
| `dndTypes.ts` | Drag & drop type definitions |
| `mockProvider.ts` | Mock data for development (Stage 1) |

## Props & Extension Points

### WeekBoard Props
```typescript
interface WeekBoardProps {
  planId: string;           // Trip/plan identifier
  startMs: number;          // Monday 00:00 in local time
  endMs: number;            // Sunday 23:59 in local time
  className?: string;
}
```

### DnD Sensor Configuration
- **Pointer Sensor**: 8px activation distance (prevents accidental drags)
- **Keyboard Sensor**: Full a11y support with `sortableKeyboardCoordinates`
- **Modifiers**: `restrictToWindowEdges` prevents dragging outside viewport

### Time Grid Configuration
```typescript
// From timeMath.ts
export const HOUR_HEIGHT = 60;          // pixels per hour
export const DEFAULT_SNAP_MINUTES = 30; // normal snapping
export const FINE_SNAP_MINUTES = 5;     // Alt+drag snapping
export const START_HOUR = 8;            // 8 AM
export const END_HOUR = 20;             // 8 PM
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between draggable items |
| `Space` | Activate drag mode |
| `Arrow Keys` | Move drag preview between drop zones |
| `Enter` | Drop item in current zone |
| `Escape` | Cancel drag operation |

## Accessibility Features

### Screen Reader Support
- Live region announcements for all drag operations
- Format: "Moved 'Event Title' from Monday 9:00 AM to Tuesday 2:00 PM"
- Focus returns to moved element after successful drop

### Visual Indicators  
- Focus rings on all interactive elements
- High contrast drag overlays and drop zone highlights
- `prefers-reduced-motion` respected (disables drag animations)

### ARIA Labels
- All drag items have descriptive labels
- Drop zones announce their purpose
- Time slots include time information

## Testing

### E2E Tests (Playwright)
```bash
npx playwright test tests/e2e/weekboard.spec.ts
```

Tests cover:
- Basic rendering and layout
- Drag & drop functionality (mouse + keyboard)
- Event resizing
- Search and filtering
- Accessibility compliance

### Component Tests
```bash
npx vitest tests/timeMath.test.ts
```

Unit tests for:
- Time positioning calculations  
- Drag operation type determination
- Event overlap detection

## Development

### Mock Data
The `mockProvider.ts` provides realistic sample data during development:
- 4 unscheduled backlog items
- 3 all-day events spread across the week
- 7 timed events with various durations

### Hot Reloading
All components support React Fast Refresh. Drag state is preserved during code changes.

### Debug Tools
- Console logs for drag operations (development only)
- Data attributes on all key elements for testing
- Time grid overlay helpers (can be toggled via props)

## Future Enhancements

### Mobile Support
- Responsive layout with stacked columns
- Touch-friendly drag handles
- Swipe navigation between days

### Advanced Features
- Event conflicts and overlap warnings
- Custom event colors and categories
- Recurring event templates
- Print/export functionality

### Performance
- Virtualized time grid for longer time ranges
- Event clustering for dense schedules  
- Optimistic updates with rollback

## Troubleshooting

### Common Issues

**Events not dragging:**
- Check that DndContext wraps all draggable items
- Verify unique IDs on sortable elements
- Ensure drag data types match drop targets

**Positioning incorrect:**
- Verify time zone handling in `timeMath.ts`
- Check `HOUR_HEIGHT` constant matches CSS
- Validate date calculations for week bounds

**Accessibility problems:**
- Test with screen reader (NVDA/JAWS/VoiceOver)
- Verify keyboard navigation without mouse
- Check color contrast ratios meet WCAG standards

### Performance Monitoring
Monitor these metrics:
- Drag operation response time (< 16ms for 60fps)
- Memory usage during long drag sessions
- Re-render frequency during time updates