'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Id } from '../../../backend/convex/_generated/dataModel';
import EventEditor from './EventEditor';
import { 
  Calendar,
  Edit, 
  Trash2, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  CalendarX
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
  updatedAt: number;
}

interface TripListViewDnDProps {
  tripId: Id<'trips'>;
}

// Draggable List Item Component
interface DraggableListItemProps {
  event: TripEvent;
  onEdit: (event: TripEvent) => void;
  onDelete: (event: TripEvent) => void;
  onUnschedule?: (event: TripEvent) => void;
  onClick: (event: TripEvent) => void;
  className?: string;
}

function DraggableListItem({ 
  event, 
  onEdit, 
  onDelete, 
  onUnschedule, 
  onClick,
  className = '' 
}: DraggableListItemProps) {
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


  const getEventColor = (kind: EventKind) => {
    switch (kind) {
      case 'allDay':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'timed':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'unscheduled':
        return 'border-border bg-muted/50 text-foreground';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(event)}
      className={`
        group p-3 border rounded-lg cursor-grab active:cursor-grabbing 
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/50
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
        touch-none select-none
        ${getEventColor(event.kind)}
        ${isDragging ? 'opacity-0' : 'hover:shadow-md'}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate mb-1">{event.title}</h3>
          
          {event.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2">{event.notes}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 text-muted-foreground hover:text-blue-600 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {onUnschedule && event.kind !== 'unscheduled' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnschedule(event);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 text-muted-foreground hover:text-yellow-600 rounded"
              title="Unschedule"
            >
              <CalendarX className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 text-muted-foreground hover:text-red-600 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Droppable Day Section Component
interface DroppableDayProps {
  date: Date;
  events: TripEvent[];
  onEdit: (event: TripEvent) => void;
  onDelete: (event: TripEvent) => void;
  onUnschedule: (event: TripEvent) => void;
  onClick: (event: TripEvent) => void;
  selectedEvent: TripEvent | null;
  isDragOver: boolean;
  dropIndicator: { containerId: string; index: number } | null;
}

function DroppableDay({ 
  date, 
  events, 
  onEdit, 
  onDelete, 
  onUnschedule, 
  onClick, 
  selectedEvent, 
  isDragOver,
  dropIndicator 
}: DroppableDayProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

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
      className={`
        border-b border-border last:border-b-0 transition-all duration-200
        ${isDragOver ? 'bg-primary/5 border-primary/30 shadow-sm' : ''}
      `}
    >
      {/* Day Header */}
      <div className="sticky top-0 z-10 bg-muted/50 px-4 py-2 border-b border-border">
        <h3 className="font-medium text-foreground">
          {format(date, 'EEE MMM d')}
        </h3>
      </div>

      {/* Events List */}
      {events.length > 0 && (
        <div className="p-4 space-y-2 bg-muted/50">
          {events.map((event, index) => (
            <div key={event._id} className="relative">
              {/* Drop indicator line before event */}
              {dropIndicator?.containerId === format(date, 'yyyy-MM-dd') && dropIndicator.index === index && (
                <div className="h-0.5 bg-primary rounded-full shadow-sm mb-2" />
              )}
              
              <DraggableListItem
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                onUnschedule={onUnschedule}
                onClick={onClick}
              />
            </div>
          ))}
          
          {/* Drop indicator line after all events */}
          {dropIndicator?.containerId === format(date, 'yyyy-MM-dd') && dropIndicator.index === events.length && (
            <div className="h-0.5 bg-primary rounded-full shadow-sm mt-2" />
          )}
        </div>
      )}
      
      {/* Drop indicator for empty days */}
      {events.length === 0 && dropIndicator?.containerId === format(date, 'yyyy-MM-dd') && (
        <div className="p-4 bg-muted/50">
          <div className="h-0.5 bg-primary rounded-full shadow-sm" />
        </div>
      )}
    </div>
  );
}

// Droppable Unscheduled Area Component
function DroppableUnscheduledArea({ 
  events, 
  onEdit, 
  onDelete, 
  onClick, 
  selectedEvent, 
  isDragOver,
  dropIndicator 
}: {
  events: TripEvent[];
  onEdit: (event: TripEvent) => void;
  onDelete: (event: TripEvent) => void;
  onClick: (event: TripEvent) => void;
  selectedEvent: TripEvent | null;
  isDragOver: boolean;
  dropIndicator: { containerId: string; index: number } | null;
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
      className={`
        h-full border-l border-border bg-muted/50 transition-all duration-200
        ${isDragOver ? 'bg-primary/5 border-primary/30' : ''}
      `}
    >
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plus className="w-4 h-4 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-foreground">Unscheduled</h3>
              <p className="text-sm text-muted-foreground">{events.length} ideas</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {events.map((event, index) => (
          <div key={event._id} className="relative">
            {/* Drop indicator line before event */}
            {dropIndicator?.containerId === 'unscheduled' && dropIndicator.index === index && (
              <div className="h-0.5 bg-primary rounded-full shadow-sm mb-2" />
            )}
            
            <DraggableListItem
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onClick}
            />
          </div>
        ))}
        
        {/* Drop indicator line after all events */}
        {dropIndicator?.containerId === 'unscheduled' && dropIndicator.index === events.length && (
          <div className="h-0.5 bg-primary rounded-full shadow-sm mt-2" />
        )}
        
        {events.length === 0 && !isDragOver && (
          <div className="text-center py-8 text-muted-foreground">
            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No unscheduled ideas</p>
            <p className="text-xs mt-1">Drag events here to unschedule</p>
          </div>
        )}
        
        {/* Drop indicator for empty unscheduled area */}
        {events.length === 0 && isDragOver && dropIndicator?.containerId === 'unscheduled' && (
          <div className="h-0.5 bg-primary rounded-full shadow-sm" />
        )}
      </div>
    </div>
  );
}

export default function TripListViewDnD({ tripId }: TripListViewDnDProps) {
  const [editingEvent, setEditingEvent] = useState<TripEvent | null>(null);
  const [showEventEditor, setShowEventEditor] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TripEvent | null>(null);
  const [currentDateRange, setCurrentDateRange] = useState(() => {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  });

  // @dnd-kit state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    containerId: string;
    index: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const trip = useQuery(api.trips.getTripById, { tripId });
  const events = useQuery(api.tripEvents.getTripEvents, { tripId });
  const deleteTripEvent = useMutation(api.tripEvents.deleteTripEvent);
  const updateTripEvent = useMutation(api.tripEvents.updateTripEvent);

  const handleDeleteEvent = async (event: TripEvent) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteTripEvent({ eventId: event._id });
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleEditEvent = (event: TripEvent) => {
    setEditingEvent(event);
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

  const closeEventEditor = () => {
    setShowEventEditor(false);
    setEditingEvent(null);
  };

  // @dnd-kit drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      setDragOverDate(null);
      setDropIndicator(null);
      return;
    }

    // Check if dropping on unscheduled area
    if (over.id === 'unscheduled-area') {
      setDragOverDate('unscheduled');
      const unscheduledEvents = events ? events.filter(e => e.kind === 'unscheduled') : [];
      setDropIndicator({
        containerId: 'unscheduled',
        index: unscheduledEvents.length
      });
      return;
    }

    // Check if dropping on calendar date
    if (over.data.current?.type === 'date') {
      const targetDate = over.data.current.date;
      setDragOverDate(targetDate);
      const dayEvents = getEventsForDate(targetDate);
      setDropIndicator({
        containerId: targetDate,
        index: dayEvents.length
      });
      return;
    }

    setDropIndicator(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverDate(null);
    setDropIndicator(null);

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

      // Handle dropping on calendar date
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
      }
    } catch (error) {
      console.error('Failed to move event:', error);
    }
  };

  // Compute derived state
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

  // Get date range for display
  const dateRange = useMemo(() => {
    if (trip && trip.startDate && trip.endDate) {
      return eachDayOfInterval({
        start: new Date(trip.startDate),
        end: new Date(trip.endDate)
      });
    }
    return eachDayOfInterval({
      start: currentDateRange.start,
      end: currentDateRange.end
    });
  }, [trip, currentDateRange]);

  const getEventsForDate = (dateStr: string) => {
    return eventsByDate[dateStr] || [];
  };

  // Find the currently dragged event for the overlay
  const activeEvent = useMemo(() => {
    return activeId && events ? events.find(e => e._id === activeId) : null;
  }, [activeId, events]);

  if (!trip || !events) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading trip...</div>
      </div>
    );
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
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">{trip.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(dateRange[0], 'MMM d')} - {format(dateRange[dateRange.length - 1], 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDateRange(prev => ({
                  start: new Date(prev.start.getFullYear(), prev.start.getMonth() - 1, 1),
                  end: new Date(prev.start.getFullYear(), prev.start.getMonth(), 0)
                }))}
                className="p-2 hover:bg-secondary rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDateRange(() => {
                  const now = new Date();
                  return {
                    start: startOfMonth(now),
                    end: endOfMonth(now)
                  };
                })}
                className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDateRange(prev => ({
                  start: new Date(prev.start.getFullYear(), prev.start.getMonth() + 1, 1),
                  end: new Date(prev.start.getFullYear(), prev.start.getMonth() + 2, 0)
                }))}
                className="p-2 hover:bg-secondary rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Scheduled Events (Left Column) */}
          <div className="flex-[60] overflow-y-auto">
            {dateRange.map((day) => {
              const dayEvents = getEventsForDate(format(day, 'yyyy-MM-dd'));
              const dateStr = format(day, 'yyyy-MM-dd');
              const isDragOver = dragOverDate === dateStr;

              // Always show days in the date range, but conditionally render content
              return (
                <DroppableDay
                  key={day.toISOString()}
                  date={day}
                  events={dayEvents}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onUnschedule={handleUnscheduleEvent}
                  onClick={setSelectedEvent}
                  selectedEvent={selectedEvent}
                  isDragOver={isDragOver}
                  dropIndicator={dropIndicator}
                />
              );
            })}
          </div>

          {/* Unscheduled Events (Right Column) */}
          <div className="flex-[40]">
            <DroppableUnscheduledArea
              events={unscheduledEvents}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onClick={setSelectedEvent}
              selectedEvent={selectedEvent}
              isDragOver={dragOverDate === 'unscheduled'}
              dropIndicator={dropIndicator}
            />
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEvent && (
            <div className="pointer-events-none opacity-50">
              <DraggableListItem
                event={activeEvent}
                onEdit={() => {}}
                onDelete={() => {}}
                onClick={() => {}}
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