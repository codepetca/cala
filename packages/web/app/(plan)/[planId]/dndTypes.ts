/**
 * Drag and Drop type definitions for WeekBoard
 */

import type { TripEvent } from '@trip-planner/domain';

// Source types for drag operations
export type DragSource = 'backlog' | 'allday' | 'timegrid';

// Drop target types
export type DropTarget = 'backlog' | 'allday' | 'timegrid';

// Base drag data
export interface BaseDragData {
  eventId: string;
  event: TripEvent;
  source: DragSource;
}

// Backlog drag data
export interface BacklogDragData extends BaseDragData {
  source: 'backlog';
}

// All-day drag data  
export interface AllDayDragData extends BaseDragData {
  source: 'allday';
  originalDate: string; // YYYY-MM-DD
}

// Time grid drag data
export interface TimeGridDragData extends BaseDragData {
  source: 'timegrid';
  originalDate: string; // YYYY-MM-DD
  originalStart: number; // ms
  originalEnd: number; // ms
}

// Discriminated union for all drag data
export type DragData = BacklogDragData | AllDayDragData | TimeGridDragData;

// Drop target data for different zones
export interface BacklogDropTarget {
  type: 'backlog';
}

export interface AllDayDropTarget {
  type: 'allday';
  date: string; // YYYY-MM-DD
}

export interface TimeGridDropTarget {
  type: 'timegrid';
  date: string; // YYYY-MM-DD
  startTime: number; // ms
  endTime?: number; // ms, optional for initial drop
}

// Discriminated union for all drop targets
export type DropTargetData = BacklogDropTarget | AllDayDropTarget | TimeGridDropTarget;

// Drag operation types
export type DragOperation = 
  | 'move-to-backlog'           // Any → Backlog (unschedule)
  | 'schedule-all-day'          // Backlog → All-day
  | 'schedule-timed'            // Backlog → Time grid  
  | 'reschedule-all-day'        // All-day → All-day (different date)
  | 'reschedule-timed'          // Timed → Time grid
  | 'convert-to-all-day'        // Timed → All-day
  | 'convert-to-timed'          // All-day → Time grid
  | 'invalid';

// Drag state for UI feedback
export interface DragState {
  isDragging: boolean;
  dragData: DragData | null;
  overId: string | null;
  snapPreview: {
    date: string;
    startTime?: number;
    endTime?: number;
  } | null;
}

// Resize operation data
export interface ResizeData {
  eventId: string;
  originalStart: number;
  originalEnd: number;
  handle: 'top' | 'bottom';
}

// Time slot data for grid positioning
export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startTime: number; // ms
  endTime: number; // ms
  slotIndex: number; // 0-based index for 30min slots
}

// Overlap detection data
export interface EventOverlap {
  eventId: string;
  overlappingWith: string[];
  severity: 'minor' | 'major'; // based on overlap percentage
}

// Accessibility announcements for drag operations
export interface A11yAnnouncement {
  operation: DragOperation;
  eventTitle: string;
  from?: string;
  to?: string;
  success: boolean;
}

// Factory functions for creating drag data
export function createBacklogDragData(event: TripEvent): BacklogDragData {
  return {
    eventId: event.id,
    event,
    source: 'backlog'
  };
}

export function createAllDayDragData(event: TripEvent, date: string): AllDayDragData {
  return {
    eventId: event.id,
    event,
    source: 'allday',
    originalDate: date
  };
}

export function createTimeGridDragData(
  event: TripEvent, 
  date: string, 
  start: number, 
  end: number
): TimeGridDragData {
  return {
    eventId: event.id,
    event,
    source: 'timegrid',
    originalDate: date,
    originalStart: start,
    originalEnd: end
  };
}

// Utility to determine drag operation type
export function getDragOperation(
  dragData: DragData, 
  dropTarget: DropTargetData
): DragOperation {
  const { source } = dragData;
  const { type } = dropTarget;

  if (type === 'backlog') {
    return 'move-to-backlog';
  }

  if (source === 'backlog') {
    return type === 'allday' ? 'schedule-all-day' : 'schedule-timed';
  }

  if (source === 'allday') {
    if (type === 'allday') {
      const allDayData = dragData as AllDayDragData;
      const allDayTarget = dropTarget as AllDayDropTarget;
      return allDayData.originalDate === allDayTarget.date 
        ? 'invalid' 
        : 'reschedule-all-day';
    }
    return 'convert-to-timed';
  }

  if (source === 'timegrid') {
    if (type === 'timegrid') {
      const timeData = dragData as TimeGridDragData;
      const timeTarget = dropTarget as TimeGridDropTarget;
      return timeData.originalDate === timeTarget.date &&
             timeData.originalStart === timeTarget.startTime
        ? 'invalid'
        : 'reschedule-timed';
    }
    return 'convert-to-all-day';
  }

  return 'invalid';
}

// Format announcement text for screen readers
export function formatA11yAnnouncement(announcement: A11yAnnouncement): string {
  const { operation, eventTitle, from, to, success } = announcement;
  
  if (!success) {
    return `Failed to move ${eventTitle}`;
  }

  switch (operation) {
    case 'move-to-backlog':
      return `Moved ${eventTitle} to backlog`;
    case 'schedule-all-day':
      return `Scheduled ${eventTitle} for ${to}`;
    case 'schedule-timed':
      return `Scheduled ${eventTitle} for ${to}`;
    case 'reschedule-all-day':
      return `Moved ${eventTitle} from ${from} to ${to}`;
    case 'reschedule-timed':
      return `Moved ${eventTitle} from ${from} to ${to}`;
    case 'convert-to-all-day':
      return `Changed ${eventTitle} to all-day event on ${to}`;
    case 'convert-to-timed':
      return `Changed ${eventTitle} to timed event at ${to}`;
    default:
      return `Moved ${eventTitle}`;
  }
}