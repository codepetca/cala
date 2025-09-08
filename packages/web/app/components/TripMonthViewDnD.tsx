'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, format, startOfWeek, endOfWeek } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Id } from '../../../backend/convex/_generated/dataModel';
import EventEditor from './EventEditor';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
  rectIntersection,
} from '@dnd-kit/core';

type EventKind = 'unscheduled' | 'allDay' | 'timed';

interface TripEvent {
  _id: Id<'tripEvents'>;
  title: string;
  notes?: string;
  kind: EventKind;
  startDate?: number;
  endDate?: number;
  startDateTime?: number;
  endDateTime?: number;
  createdAt: number;
}

interface TripMonthViewProps {
  tripId: Id<'trips'>;
}

// Draggable Event Component
interface DraggableEventProps {
  event: TripEvent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEdit: (event: TripEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDelete: (eventId: Id<'tripEvents'>) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUnschedule?: (event: TripEvent) => void;
  onClick: (event: TripEvent) => void;
  isSelected: boolean;
  className?: string;
}

function DraggableEvent({ 
  event, 
  onEdit: _onEdit, 
  onDelete: _onDelete, 
  onUnschedule: _onUnschedule, 
  onClick, 
  isSelected, 
  className = '' 
}: DraggableEventProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: event._id,
    data: {
      type: 'event',
      event,
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const formatEventTime = (event: TripEvent) => {
    if (event.kind === 'timed' && event.startDateTime && event.endDateTime) {
      const start = new Date(event.startDateTime);
      const end = new Date(event.endDateTime);
      return `${formatInTimeZone(start, 'UTC', 'HH:mm')} - ${formatInTimeZone(end, 'UTC', 'HH:mm')}`;
    }
    return '';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(event)}
      role="button"
      tabIndex={0}
      aria-label={`${event.title} - ${event.kind === 'allDay' ? 'All day event' : event.kind === 'timed' ? 'Timed event' : 'Unscheduled event'}. Press space to select, or drag to move.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(event);
        }
      }}
      className={`
        p-1.5 rounded text-xs cursor-grab active:cursor-grabbing transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${event.kind === 'allDay'
          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
          : event.kind === 'timed'
          ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
        }
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
        ${isDragging ? 'opacity-30' : 'hover:shadow-md hover:scale-105'}
        ${className}
      `}
    >
      <div className="font-medium truncate">{event.title}</div>
      {event.kind === 'timed' && (
        <div className="text-xs opacity-75">
          {formatEventTime(event)}
        </div>
      )}
      {event.kind === 'unscheduled' && event.notes && (
        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{event.notes}</div>
      )}
    </div>
  );
}

// Droppable Day Cell Component  
interface DroppableDayProps {
  date: Date;
  events: TripEvent[];
  onEdit: (event: TripEvent) => void;
  onDelete: (event: TripEvent) => void;
  onUnschedule: (event: TripEvent) => void;
  onClick: (event: TripEvent) => void;
  onCreateEvent: (dateStr: string) => void;
  selectedEvent: TripEvent | null;
  isDragOver: boolean;
  insertIndex?: number;
  draggedHeight: number;
  eventRefs: React.MutableRefObject<Map<string, HTMLElement>>;
}

function DroppableDay({ 
  date, 
  events, 
  onEdit: _onEdit, 
  onDelete: _onDelete, 
  onUnschedule: _onUnschedule, 
  onClick, 
  onCreateEvent: _onCreateEvent, 
  selectedEvent, 
  isDragOver, 
  insertIndex, 
  draggedHeight, 
  eventRefs,
}: DroppableDayProps) {
  const isCurrentMonth = isSameMonth(date, new Date());
  const isToday = isSameDay(date, new Date());
  const dateStr = format(date, 'yyyy-MM-dd');

  const { setNodeRef } = useDroppable({
    id: `date-${dateStr}`,
    data: {
      type: 'date',
      date: dateStr,
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] border-r border-b border-border last:border-r-0 p-2 transition-all duration-200 ${
        isCurrentMonth ? 'bg-card' : 'bg-muted/50'
      } ${isDragOver ? 'bg-gradient-to-br from-blue-50 to-purple-50 ring-2 ring-blue-400 ring-offset-1 shadow-lg' : ''} group`}
      data-date={dateStr}
      role="gridcell"
      aria-label={`${format(date, 'EEEE, MMMM d, yyyy')}. ${events.length} events. ${isDragOver ? 'Drop zone active.' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-sm font-medium ${
          isCurrentMonth 
            ? isToday 
              ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center' 
              : 'text-gray-900'
            : 'text-gray-400'
        }`}>
          {format(date, 'd')}
        </span>
        {isCurrentMonth && (
          <button
            onClick={() => _onCreateEvent(dateStr)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 text-xs"
          >
            +
          </button>
        )}
      </div>

      {/* Events for this day */}
      <div className="space-y-1 min-h-[80px]">
        {/* Show insertion indicator at top if index is 0 */}
        {isDragOver && insertIndex === 0 && (
          <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full my-1 animate-pulse shadow-lg opacity-90" />
        )}
        
        {events.map((event, index) => {
          // Smart displacement: events at insertIndex and below should move down
          const shouldDisplace = isDragOver && insertIndex !== undefined && index >= insertIndex;
          const displacementClass = shouldDisplace ? 'transform translate-y-6 transition-transform duration-200' : '';
          
          return (
            <div key={event._id} className="relative">
              <DraggableEvent
                event={event}
                onEdit={_onEdit}
                onDelete={_onDelete}
                onUnschedule={_onUnschedule}
                onClick={onClick}
                isSelected={selectedEvent?._id === event._id}
                className={displacementClass}
              />
              
              {/* Show insertion indicator between events */}
              {isDragOver && insertIndex === index + 1 && (
                <div className="absolute -bottom-0.5 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse shadow-lg z-10 opacity-90" />
              )}
            </div>
          );
        })}
        
        {/* Handle case where we want to insert at the end but showing more events */}
        {isDragOver && insertIndex === Math.min(events.length, 3) && events.length <= 3 && (
          <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full my-1 animate-pulse shadow-lg opacity-90" />
        )}
        
        {events.length > 3 && (
          <div className="text-xs text-gray-500 p-1">
            +{events.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

// Droppable Unscheduled Area
function DroppableUnscheduledArea({ 
  events, 
  onEdit: _onEdit, 
  onDelete: _onDelete, 
  onClick, 
  selectedEvent, 
  isDragOver 
}: {
  events: TripEvent[];
  onEdit: (event: TripEvent) => void;
  onDelete: (eventId: Id<'tripEvents'>) => void;
  onClick: (event: TripEvent) => void;
  selectedEvent: TripEvent | null;
  isDragOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: 'unscheduled-area',
    data: {
      type: 'unscheduled',
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`p-4 border-b border-border transition-all duration-200 ${
        isDragOver ? 'bg-gradient-to-br from-yellow-50 to-amber-50 ring-2 ring-yellow-400 ring-offset-1 shadow-lg' : ''
      }`}
      role="region"
      aria-label={`Unscheduled events area. ${events.length} unscheduled events. ${isDragOver ? 'Drop zone active - events dropped here will become unscheduled.' : ''}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">Ideas & Unscheduled</h3>
        <span className="text-sm text-gray-500">{events.length}</span>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <DraggableEvent
            key={event._id}
            event={event}
            onEdit={_onEdit}
            onDelete={_onDelete}
            onClick={onClick}
            isSelected={selectedEvent?._id === event._id}
            className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-secondary"
          />
        ))}
        
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💡</div>
            <p className="text-sm">No ideas yet</p>
            <p className="text-xs">Drag events here or create new ones</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TripMonthView({ tripId }: TripMonthViewProps) {
  const [editingEvent, setEditingEvent] = useState<TripEvent | null>(null);
  const [showEventEditor, setShowEventEditor] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<TripEvent | null>(null);
  const eventRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [eventHeights, setEventHeights] = useState<Record<string, number>>({});
  const [draggedHeight, setDraggedHeight] = useState<number>(0);
  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const resizeObs = new ResizeObserver((entries) => {
      setEventHeights((prev) => {
        const next = { ...prev } as Record<string, number>;
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.eventId as string | undefined;
          if (id) next[id] = e.contentRect.height;
        }
        return next;
      });
    });
    for (const el of eventRefs.current.values()) resizeObs.observe(el);
    return () => resizeObs.disconnect();
  }, [selectedEvent]);
  
  // @dnd-kit state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | undefined>(undefined);
  
  const trip = useQuery(api.trips.getTripById, { tripId });
  const events = useQuery(api.tripEvents.getTripEvents, { tripId });
  const deleteTripEvent = useMutation(api.tripEvents.deleteTripEvent);
  const updateTripEvent = useMutation(api.tripEvents.updateTripEvent);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Calendar calculations
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDeleteEvent = async (eventId: Id<'tripEvents'>) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteTripEvent({ eventId });
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleEditEvent = (event: TripEvent) => {
    setEditingEvent(event);
    setShowEventEditor(true);
  };

  const closeEventEditor = () => {
    setShowEventEditor(false);
    setEditingEvent(null);
  };

  const handleCreateEvent = (dateStr: string) => {
    const dateTimestamp = new Date(dateStr + 'T00:00:00').getTime();
    setEditingEvent({
      _id: 'new' as Id<'tripEvents'>,
      title: '',
      kind: 'allDay',
      startDate: dateTimestamp,
      endDate: dateTimestamp,
      createdAt: Date.now(),
    });
    setShowEventEditor(true);
  };

  const handleUnscheduleEvent = async (event: TripEvent) => {
    try {
      await updateTripEvent({
        eventId: event._id,
        kind: 'unscheduled',
        startDate: undefined,
        endDate: undefined,
        startDateTime: undefined,
        endDateTime: undefined,
      });
    } catch (error) {
      console.error('Failed to unschedule event:', error);
    }
  };

  // @dnd-kit drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
  const { active, over } = event;

  if (!over) {
    setDragOverDate(null);
    setInsertIndex(undefined);
    return;
  }

  // Unscheduled area
  if (over.id === 'unscheduled-area') {
    setDragOverDate('unscheduled');
    setInsertIndex(undefined);
    return;
  }

  // Hovering a day cell
  if (over.data.current?.type === 'date') {
    const targetDate = over.data.current.date as string;
    setDragOverDate(targetDate);

    const dayEvents = getEventsForDate(new Date(targetDate + 'T00:00:00'));

    // Determine index by comparing pointer to item midpoints
    const overRect = over.rect;
    const pointerClientY = (event as any).activatorEvent?.clientY ?? overRect.top + overRect.height / 2;

    // Build thresholds
    let running = overRect.top;
    let idx = 0;
    for (let i = 0; i < dayEvents.length; i++) {
      const id = dayEvents[i]._id as string;
      const h = eventHeights[id] ?? (eventRefs.current.get(id)?.offsetHeight ?? 32);
      const midpoint = running + h / 2;
      if (pointerClientY < midpoint) { idx = i; break; }
      running += h;
      idx = i + 1;
    }

    setInsertIndex(idx);
    const dh = eventHeights[(active.id as string)] ?? (eventRefs.current.get(active.id as string)?.offsetHeight ?? 32);
    setDraggedHeight(dh);
    return;
  }

  // Hovering another event card
  if (over.data.current?.type === 'event') {
    const targetEvent = over.data.current?.event as TripEvent;
    if (targetEvent && targetEvent.kind !== 'unscheduled') {
      const targetDate =
        targetEvent.kind === 'allDay'
          ? new Date(targetEvent.startDate!).toISOString().split('T')[0]
          : new Date(targetEvent.startDateTime!).toISOString().split('T')[0];

      setDragOverDate(targetDate);

      const rect = over.rect;
      const pointerClientY = (event as any).activatorEvent?.clientY ?? rect.top + rect.height / 2;
      const after = pointerClientY > rect.top + rect.height / 2;

      const dayEvents = getEventsForDate(new Date(targetDate + 'T00:00:00'));
      const targetIdx = dayEvents.findIndex(e => e._id === targetEvent._id);
      setInsertIndex(Math.max(0, targetIdx + (after ? 1 : 0)));

      const dh = eventHeights[(active.id as string)] ?? (eventRefs.current.get(active.id as string)?.offsetHeight ?? 32);
      setDraggedHeight(dh);
    }
  }
};

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverDate(null);
    setInsertIndex(undefined);

    if (!over || !events) return;

    const activeEvent = events.find(e => e._id === active.id);
    if (!activeEvent) return;

    try {
      // Handle dropping on unscheduled area
      if (over.id === 'unscheduled-area') {
        await updateTripEvent({
          eventId: activeEvent._id,
          kind: 'unscheduled',
          startDate: undefined,
          endDate: undefined,
          startDateTime: undefined,
          endDateTime: undefined,
        });
        return;
      }

      // Handle dropping on calendar date directly
      if (over.data.current?.type === 'date') {
        const targetDate = over.data.current.date;
        const targetTimestamp = new Date(targetDate + 'T00:00:00').getTime();
        
        if (activeEvent.kind === 'unscheduled') {
          // Convert unscheduled to all-day event
          await updateTripEvent({
            eventId: activeEvent._id,
            kind: 'allDay',
            startDate: targetTimestamp,
            endDate: targetTimestamp,
          });
        } else if (activeEvent.kind === 'allDay') {
          // Move all-day event to different date
          await updateTripEvent({
            eventId: activeEvent._id,
            kind: 'allDay',
            startDate: targetTimestamp,
            endDate: targetTimestamp,
          });
        } else if (activeEvent.kind === 'timed') {
          // Move timed event to different date, preserving time
          const originalStartTime = activeEvent.startDateTime 
            ? new Date(activeEvent.startDateTime).toISOString().split('T')[1] 
            : '09:00:00';
          const originalEndTime = activeEvent.endDateTime 
            ? new Date(activeEvent.endDateTime).toISOString().split('T')[1] 
            : '17:00:00';
          
          const newStartDateTime = new Date(`${targetDate}T${originalStartTime}`).getTime();
          const newEndDateTime = new Date(`${targetDate}T${originalEndTime}`).getTime();
          
          await updateTripEvent({
            eventId: activeEvent._id,
            kind: 'timed',
            startDateTime: newStartDateTime,
            endDateTime: newEndDateTime,
          });
        }
        return;
      }

      // Handle dropping on another event (move to same date)
      if (over.data.current?.type === 'event') {
        const targetEvent = over.data.current?.event as TripEvent;
        
        if (targetEvent && targetEvent.kind !== 'unscheduled') {
          let targetDate: string;
          if (targetEvent.kind === 'allDay' && targetEvent.startDate) {
            targetDate = new Date(targetEvent.startDate).toISOString().split('T')[0];
          } else if (targetEvent.kind === 'timed' && targetEvent.startDateTime) {
            targetDate = new Date(targetEvent.startDateTime).toISOString().split('T')[0];
          } else {
            return;
          }
          
          const targetTimestamp = new Date(targetDate + 'T00:00:00').getTime();
          
          if (activeEvent.kind === 'unscheduled') {
            // Convert unscheduled to all-day event on target date
            await updateTripEvent({
              eventId: activeEvent._id,
              kind: 'allDay',
              startDate: targetTimestamp,
              endDate: targetTimestamp,
            });
          } else if (activeEvent.kind === 'allDay') {
            // Move all-day event to target date
            await updateTripEvent({
              eventId: activeEvent._id,
              kind: 'allDay',
              startDate: targetTimestamp,
              endDate: targetTimestamp,
            });
          } else if (activeEvent.kind === 'timed') {
            // Move timed event to target date, preserving time
            const originalStartTime = activeEvent.startDateTime 
              ? new Date(activeEvent.startDateTime).toISOString().split('T')[1] 
              : '09:00:00';
            const originalEndTime = activeEvent.endDateTime 
              ? new Date(activeEvent.endDateTime).toISOString().split('T')[1] 
              : '17:00:00';
            
            const newStartDateTime = new Date(`${targetDate}T${originalStartTime}`).getTime();
            const newEndDateTime = new Date(`${targetDate}T${originalEndTime}`).getTime();
            
            await updateTripEvent({
              eventId: activeEvent._id,
              kind: 'timed',
              startDateTime: newStartDateTime,
              endDateTime: newEndDateTime,
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to move event:', error);
    }
  };

  // Compute derived state before any early returns
  const scheduledEvents = events ? events.filter((event) => event.kind !== 'unscheduled') : [];
  const unscheduledEvents = events ? events.filter((event) => event.kind === 'unscheduled') : [];

  // Group events by date
  const eventsByDate = useMemo(() => {
    return scheduledEvents.reduce((acc, event) => {
      let date: string | undefined;
      if (event.kind === 'allDay' && event.startDate) {
        date = new Date(event.startDate).toISOString().split('T')[0];
      } else if (event.kind === 'timed' && event.startDateTime) {
        date = new Date(event.startDateTime).toISOString().split('T')[0];
      }
      
      if (date) {
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
      }
      return acc;
    }, {} as Record<string, TripEvent[]>);
  }, [scheduledEvents]);

  // Find the currently dragged event for the overlay
  const activeEvent = useMemo(() => {
    return activeId && events ? events.find(e => e._id === activeId) : null;
  }, [activeId, events]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateStr] || [];
  };

  if (!trip || !events) {
    return <div className="text-center py-8">Loading trip...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-muted/50">
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Calendar View */}
          <div className="flex-1 flex flex-col">
            {/* Calendar Header */}
            <div className="bg-card border-b border-border px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-secondary rounded-md transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-card rounded-lg shadow-sm border border-border">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-border">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-border last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isDragOver = dragOverDate === dateStr;

                    return (
                      <DroppableDay
                        key={day.toISOString()}
                        date={day}
                        events={dayEvents}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        onUnschedule={handleUnscheduleEvent}
                        onClick={setSelectedEvent}
                        onCreateEvent={handleCreateEvent}
                        selectedEvent={selectedEvent}
                        isDragOver={isDragOver}
                        insertIndex={insertIndex}
                        draggedHeight={draggedHeight}
                        eventRefs={eventRefs}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-card border-l border-border flex flex-col">
            {/* Unscheduled Events */}
            <DroppableUnscheduledArea
              events={unscheduledEvents}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onClick={setSelectedEvent}
              selectedEvent={selectedEvent}
              isDragOver={dragOverDate === 'unscheduled'}
            />

            {/* Event Details */}
            {selectedEvent && (
              <div className="flex-1 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{selectedEvent.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        selectedEvent.kind === 'allDay' 
                          ? 'bg-blue-100 text-blue-800' 
                          : selectedEvent.kind === 'timed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {selectedEvent.kind === 'allDay' ? 'All Day' : 
                         selectedEvent.kind === 'timed' ? 'Timed' : 'Unscheduled'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedEvent.notes && (
                    <div>
                      <div className="text-xs font-medium text-secondary-foreground mb-1">Notes</div>
                      <div className="text-sm text-gray-600">{selectedEvent.notes}</div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <button
                      onClick={() => handleEditEvent(selectedEvent)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    {selectedEvent.kind !== 'unscheduled' && (
                      <button
                        onClick={() => handleUnscheduleEvent(selectedEvent)}
                        className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        Unschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEvent && (
            <div className="pointer-events-none">
              <DraggableEvent
                event={activeEvent}
                onEdit={() => {}}
                onDelete={() => {}}
                onClick={() => {}}
                isSelected={false}
                className="shadow-lg"
              />
            </div>
          )}
        </DragOverlay>

        {showEventEditor && (
          <EventEditor
            tripId={tripId}
            event={editingEvent}
            onClose={closeEventEditor}
          />
        )}
      </div>
    </DndContext>
  );
}