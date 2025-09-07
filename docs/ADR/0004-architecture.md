# ADR 0004: Unscheduled Event Semantics

## Status
Accepted

## Context
Trip planning often begins with a backlog of ideas or tasks that are not yet assigned to specific dates or times. Traditional calendar models (e.g., iCalendar VEVENT) require a `DTSTART`, making it awkward to represent unscheduled items.  
To support flexible planning, the system must allow events without a start or end date.

## Decision
Introduce a dedicated **`unscheduled`** event type in the domain model.

- Events are represented as a discriminated union:  
  - `timed` (with `start` and `end`)  
  - `allDay` (with a specific date)  
  - `unscheduled` (no date/time fields, only metadata and a backlog ordering key)  
- Users can freely create unscheduled events in a backlog column.  
- Unscheduled events can later be converted to `timed` or `allDay` events via mutation.  

## Consequences

### Positive
- Supports flexible, iterative trip planning.  
- Clear distinction in data model prevents invalid “empty” timed events.  
- Easy UI representation (backlog column).  
- Aligns with common user workflows (brainstorm first, schedule later).  

### Negative
- Diverges from standard iCalendar VEVENT which requires `DTSTART`.  
- Requires custom export/import handling for iCal interoperability.  
- Extra complexity in queries and UI grouping.  

## Alternatives Considered
- **Allow null start dates in timed events**  
  - Rejected: Leads to inconsistent data and unclear semantics.  
- **Represent backlog items outside the event model**  
  - Rejected: Would split similar objects into different systems, increasing code complexity.  

## Notes
When exporting to iCalendar, unscheduled events may be mapped to `VTODO` or encoded as `VEVENT` with a custom property (e.g., `X-BACKLOG:TRUE`).

## Notes
When exporting to iCalendar, unscheduled events may be mapped to `VTODO` or encoded as `VEVENT` with a custom property (e.g., `X-BACKLOG:TRUE`).  

For the canonical definitions of `scheduled` and `unscheduled` items, see [domain.md](../domain.md).