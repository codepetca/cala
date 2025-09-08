'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Id } from '../../../backend/convex/_generated/dataModel';
import EventEditor from './EventEditor';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Plus, 
  GripVertical,
  ChevronLeft,
  ChevronRight,
  CalendarX
} from 'lucide-react';
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

  const formatEventTime = (event: TripEvent) => {
    if (event.kind === 'timed' && event.startDateTime && event.endDateTime) {
      const start = new Date(event.startDateTime);
      const end = new Date(event.endDateTime);
      if (start.toDateString() === end.toDateString()) {
        return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
      }
      return `${format(start, 'MMM d, HH:mm')} - ${format(end, 'MMM d, HH:mm')}`;
    }
    if (event.kind === 'allDay' && event.startDate) {
      return format(new Date(event.startDate), 'MMM d, yyyy');
    }
    return '';
  };

  const getEventIcon = (kind: EventKind) => {
    switch (kind) {
      case 'timed':
        return <Clock className="w-4 h-4" />;
      case 'allDay':
        return <Calendar className="w-4 h-4" />;
      case 'unscheduled':
        return <Plus className="w-4 h-4" />;
    }
  };

  const getEventColor = (kind: EventKind) => {
    switch (kind) {
      case 'allDay':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'timed':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'unscheduled':
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => onClick(event)}
      className={`
        group p-3 border rounded-lg cursor-pointer transition-all duration-200
        hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        ${getEventColor(event.kind)}
        ${isDragging ? 'opacity-30' : 'hover:shadow-md'}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {getEventIcon(event.kind)}
            <h3 className="font-medium truncate">{event.title}</h3>
            <div
              {...listeners}
              className="opacity-0 group-hover:opacity-100 p-1 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          {event.notes && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.notes}</p>
          )}
          
          {formatEventTime(event) && (
            <div className="text-xs text-gray-500 mb-2">
              {formatEventTime(event)}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
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
              className="p-1 text-gray-400 hover:text-yellow-600 rounded"
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
            className="p-1 text-gray-400 hover:text-red-600 rounded"
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
  insertIndex?: number;
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
  insertIndex 
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
        border-b border-gray-100 last:border-b-0 transition-colors duration-200
        ${isDragOver ? 'bg-blue-50 border-blue-200' : ''}
      `}
    >
      {/* Day Header */}
      <div className={`
        sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-100
        ${isToday ? 'bg-blue-50 border-blue-200' : ''}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <h3 className={`font-medium ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                {format(date, 'EEEE, MMMM d')}
              </h3>
              <p className="text-sm text-gray-500">{events.length} events</p>
            </div>
          </div>
          {isToday && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 space-y-2 min-h-[120px]">
        {/* Show insertion indicator at top if index is 0 */}
        {isDragOver && insertIndex === 0 && (
          <div className="h-0.5 bg-blue-400 rounded-full animate-pulse shadow-sm" />
        )}
        
        {events.map((event, index) => {
          // Smart displacement: events at insertIndex and below should move down
          const shouldDisplace = isDragOver && insertIndex !== undefined && index >= insertIndex;
          const displacementClass = shouldDisplace ? 'transform translate-y-12 transition-transform duration-200' : '';
          
          return (
            <div key={event._id} className="relative">
              <DraggableListItem
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                onUnschedule={onUnschedule}
                onClick={onClick}
                className={displacementClass}
              />
              
              {/* Show insertion indicator between events */}
              {isDragOver && insertIndex === index + 1 && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 rounded-full animate-pulse shadow-sm z-10" />
              )}
            </div>
          );
        })}
        
        {/* Handle case where we want to insert at the end */}
        {isDragOver && insertIndex === events.length && (
          <div className="h-0.5 bg-blue-400 rounded-full animate-pulse shadow-sm" />
        )}
        
        {events.length === 0 && !isDragOver && (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events scheduled</p>
          </div>
        )}
      </div>
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
  isDragOver 
}: {
  events: TripEvent[];
  onEdit: (event: TripEvent) => void;
  onDelete: (event: TripEvent) => void;
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
      className={`
        h-full border-l border-gray-200 transition-colors duration-200
        ${isDragOver ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}
      `}
    >
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plus className="w-4 h-4 text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900">Unscheduled</h3>
              <p className="text-sm text-gray-500">{events.length} ideas</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <DraggableListItem
            key={event._id}
            event={event}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={onClick}
          />
        ))}
        
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No unscheduled ideas</p>
            <p className="text-xs mt-1">Drag events here to unschedule</p>
          </div>
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
  const [insertIndex, setInsertIndex] = useState<number | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor),
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
      setInsertIndex(undefined);
      return;
    }

    // Check if dropping on unscheduled area
    if (over.id === 'unscheduled-area') {
      setDragOverDate('unscheduled');
      setInsertIndex(undefined);
      return;
    }

    // Check if dropping on calendar date
    if (over.data.current?.type === 'date') {
      const targetDate = over.data.current.date;
      setDragOverDate(targetDate);
      
      // Calculate insertion index for visual feedback
      const dayEvents = getEventsForDate(targetDate);
      setInsertIndex(dayEvents.length); // Default to end
      return;
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
        <div className="text-gray-500">Loading trip...</div>
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
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{trip.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
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
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
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
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDateRange(prev => ({
                  start: new Date(prev.start.getFullYear(), prev.start.getMonth() + 1, 1),
                  end: new Date(prev.start.getFullYear(), prev.start.getMonth() + 2, 0)
                }))}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Scheduled Events (Left Column) */}
          <div className="flex-1 overflow-y-auto">
            {dateRange.map((day) => {
              const dayEvents = getEventsForDate(format(day, 'yyyy-MM-dd'));
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
                  selectedEvent={selectedEvent}
                  isDragOver={isDragOver}
                  insertIndex={insertIndex}
                />
              );
            })}
          </div>

          {/* Unscheduled Events (Right Column) */}
          <div className="w-80">
            <DroppableUnscheduledArea
              events={unscheduledEvents}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onClick={setSelectedEvent}
              selectedEvent={selectedEvent}
              isDragOver={dragOverDate === 'unscheduled'}
            />
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEvent && (
            <div className="pointer-events-none">
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