'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { BacklogColumn } from './BacklogColumn';
import { DayColumn } from './DayColumn';
import { ItemCard } from './ItemCard';
import { ChipCard } from './ChipCard';
import { TimedEventComponent } from './TimedEvent';

import { useMockWeekData, mockMutations } from './mockProvider';
import { 
  type DragData, 
  type DropTargetData,
  getDragOperation,
  formatA11yAnnouncement,
  type A11yAnnouncement
} from './dndTypes';
import { formatDate, formatTime } from './timeMath';

interface WeekBoardProps {
  planId: string;
  startMs: number; // Monday 00:00 in local time
  endMs: number;   // Sunday 23:59 in local time 
  className?: string;
}

export function WeekBoard({ 
  planId, 
  startMs, 
  endMs, 
  className = '' 
}: WeekBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  
  // Load week data
  const weekData = useMockWeekData(planId, startMs, endMs);
  const { backlog, days } = weekData;

  // Generate day list
  const dayList = useMemo(() => {
    const dates = [];
    const start = new Date(startMs);
    const end = new Date(endMs);
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  }, [startMs, endMs]);

  // Configure sensors for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find active drag item for overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    
    // Check backlog
    const backlogItem = backlog.find(item => item.id === activeId);
    if (backlogItem) return backlogItem;
    
    // Check days
    for (const dayEvents of Object.values(days)) {
      const allDayItem = dayEvents.allDay.find(item => item.id === activeId);
      if (allDayItem) return allDayItem;
      
      const timedItem = dayEvents.timed.find(item => item.id === activeId);
      if (timedItem) return timedItem;
    }
    
    return null;
  }, [activeId, backlog, days]);

  // Drag event handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Could add visual feedback here
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !active.data.current) return;

    const dragData = active.data.current as DragData;
    const dropData = over.data.current as DropTargetData;
    
    if (!dropData) return;

    const operation = getDragOperation(dragData, dropData);
    
    let announcementData: A11yAnnouncement = {
      operation,
      eventTitle: dragData.event.title,
      success: false
    };

    try {
      switch (operation) {
        case 'move-to-backlog':
          await mockMutations.unschedule(dragData.eventId);
          announcementData.success = true;
          break;

        case 'schedule-all-day':
          if (dropData.type === 'allday') {
            await mockMutations.scheduleAllDay(dragData.eventId, dropData.date);
            announcementData.to = formatDate(new Date(dropData.date + 'T00:00:00').getTime());
            announcementData.success = true;
          }
          break;

        case 'schedule-timed':
          if (dropData.type === 'timegrid') {
            const endTime = dropData.endTime || (dropData.startTime + (60 * 60 * 1000)); // 1 hour default
            await mockMutations.scheduleTimed(dragData.eventId, dropData.startTime, endTime);
            announcementData.to = `${formatDate(dropData.startTime)} at ${formatTime(dropData.startTime)}`;
            announcementData.success = true;
          }
          break;

        case 'reschedule-all-day':
          if (dropData.type === 'allday') {
            await mockMutations.scheduleAllDay(dragData.eventId, dropData.date);
            if (dragData.source === 'allday') {
              announcementData.from = formatDate(new Date((dragData as any).originalDate + 'T00:00:00').getTime());
            }
            announcementData.to = formatDate(new Date(dropData.date + 'T00:00:00').getTime());
            announcementData.success = true;
          }
          break;

        case 'reschedule-timed':
          if (dropData.type === 'timegrid') {
            const endTime = dropData.endTime || (dropData.startTime + (60 * 60 * 1000));
            await mockMutations.reschedule(dragData.eventId, dropData.startTime, endTime);
            if (dragData.source === 'timegrid') {
              const timeData = dragData as any;
              announcementData.from = `${formatDate(timeData.originalStart)} at ${formatTime(timeData.originalStart)}`;
            }
            announcementData.to = `${formatDate(dropData.startTime)} at ${formatTime(dropData.startTime)}`;
            announcementData.success = true;
          }
          break;

        case 'convert-to-all-day':
          if (dropData.type === 'allday') {
            await mockMutations.scheduleAllDay(dragData.eventId, dropData.date);
            announcementData.to = formatDate(new Date(dropData.date + 'T00:00:00').getTime());
            announcementData.success = true;
          }
          break;

        case 'convert-to-timed':
          if (dropData.type === 'timegrid') {
            const endTime = dropData.endTime || (dropData.startTime + (2 * 60 * 60 * 1000)); // 2 hours default
            await mockMutations.scheduleTimed(dragData.eventId, dropData.startTime, endTime);
            announcementData.to = `${formatDate(dropData.startTime)} at ${formatTime(dropData.startTime)}`;
            announcementData.success = true;
          }
          break;

        default:
          console.warn('Invalid drag operation:', operation);
      }
    } catch (error) {
      console.error('Drag operation failed:', error);
      announcementData.success = false;
    }

    // Announce result for screen readers
    const message = formatA11yAnnouncement(announcementData);
    setAnnouncement(message);
    
    // Clear announcement after screen reader has time to read it
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  // Event handlers
  const handleEventEdit = useCallback((event: any) => {
    // TODO: Open event editor modal
    console.log('Edit event:', event);
  }, []);

  const handleEventResize = useCallback(async (eventId: string, newStart: number, newEnd: number) => {
    try {
      await mockMutations.reschedule(eventId, newStart, newEnd);
    } catch (error) {
      console.error('Resize failed:', error);
    }
  }, []);

  const handleAddEvent = useCallback(() => {
    // TODO: Open new event dialog
    console.log('Add new event');
  }, []);

  return (
    <div className={`h-screen flex ${className}`} data-testid="week-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        {/* Main grid layout */}
        <div className="grid grid-cols-[320px_repeat(7,minmax(220px,1fr))] gap-4 px-6 h-full">
          {/* Backlog column */}
          <BacklogColumn
            events={backlog}
            onEdit={handleEventEdit}
            onAdd={handleAddEvent}
            className="flex-shrink-0"
          />

          {/* Day columns */}
          {dayList.map((date) => {
            const dayEvents = days[date] || { allDay: [], timed: [] };
            
            return (
              <DayColumn
                key={date}
                date={date}
                allDayEvents={dayEvents.allDay}
                timedEvents={dayEvents.timed}
                onAllDayEdit={handleEventEdit}
                onTimedEdit={handleEventEdit}
                onEventResize={handleEventResize}
                onAddAllDay={handleAddEvent}
                onAddTimed={handleAddEvent}
              />
            );
          })}
        </div>

        {/* Drag overlay */}
        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeItem ? (
            <DragOverlayContent item={activeItem} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}

// Drag overlay content component
function DragOverlayContent({ item }: { item: any }) {
  switch (item.kind) {
    case 'unscheduled':
      return (
        <ItemCard 
          event={item} 
          isDragging={true}
          className="rotate-3 shadow-xl" 
        />
      );
      
    case 'allDay':
      return (
        <ChipCard 
          event={item} 
          isDragging={true}
          className="shadow-xl" 
        />
      );
      
    case 'timed':
      return (
        <div className="w-48">
          <TimedEventComponent 
            event={item}
            date={item.startDateTime.toISOString().split('T')[0]}
            className="shadow-xl relative rotate-1" 
          />
        </div>
      );
      
    default:
      return null;
  }
}