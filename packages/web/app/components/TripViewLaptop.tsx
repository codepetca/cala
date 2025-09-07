'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState, useRef, useEffect } from 'react';
import { formatInTimeZone, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, format, startOfWeek, endOfWeek } from 'date-fns';
import { Id } from '../../../backend/convex/_generated/dataModel';
import EventEditor from './EventEditor';
import Link from 'next/link';

type EventKind = 'unscheduled' | 'allDay' | 'timed';

interface TripEvent {
  _id: Id<'tripEvents'>;
  title: string;
  notes?: string;
  kind: EventKind;
  startDate?: string;
  endDate?: string;
  startDateTime?: string;
  endDateTime?: string;
  createdAt: number;
}

interface TripViewLaptopProps {
  tripId: Id<'trips'>;
}

export default function TripViewLaptop({ tripId }: TripViewLaptopProps) {
  const [editingEvent, setEditingEvent] = useState<TripEvent | null>(null);
  const [showEventEditor, setShowEventEditor] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<TripEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TripEvent | null>(null);
  
  const trip = useQuery(api.trips.getTripById, { tripId });
  const events = useQuery(api.tripEvents.getTripEvents, { tripId });
  const deleteTripEvent = useMutation(api.tripEvents.deleteTripEvent);
  const updateTrip = useMutation(api.trips.updateTrip);
  const updateTripEvent = useMutation(api.tripEvents.updateTripEvent);

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

  const togglePublic = async () => {
    if (!trip) return;
    
    try {
      await updateTrip({
        tripId: trip._id,
        isPublic: !trip.isPublic,
      });
    } catch (error) {
      console.error('Failed to update trip:', error);
    }
  };

  const closeEventEditor = () => {
    setShowEventEditor(false);
    setEditingEvent(null);
  };

  // Drag and drop handlers
  const handleDragStart = (event: TripEvent) => {
    setDraggedEvent(event);
  };

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDragOverDate(null);
    
    if (!draggedEvent) return;

    try {
      // Convert unscheduled to all-day event
      if (draggedEvent.kind === 'unscheduled') {
        await updateTripEvent({
          eventId: draggedEvent._id,
          kind: 'allDay',
          startDate: targetDate,
          endDate: targetDate,
        });
      } else {
        // Move existing scheduled event
        const isAllDay = draggedEvent.kind === 'allDay';
        await updateTripEvent({
          eventId: draggedEvent._id,
          kind: isAllDay ? 'allDay' : 'timed',
          startDate: isAllDay ? targetDate : undefined,
          endDate: isAllDay ? targetDate : undefined,
          startDateTime: !isAllDay ? `${targetDate}T${draggedEvent.startDateTime?.split('T')[1] || '09:00'}` : undefined,
          endDateTime: !isAllDay ? `${targetDate}T${draggedEvent.endDateTime?.split('T')[1] || '17:00'}` : undefined,
        });
      }
    } catch (error) {
      console.error('Failed to move event:', error);
    }
    
    setDraggedEvent(null);
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

  if (!trip || !events) {
    return <div className="text-center py-8">Loading trip...</div>;
  }

  const scheduledEvents = events.filter((event) => event.kind !== 'unscheduled');
  const unscheduledEvents = events.filter((event) => event.kind === 'unscheduled');

  // Group events by date
  const eventsByDate = scheduledEvents.reduce((acc, event) => {
    const date = event.kind === 'allDay' ? event.startDate : event.startDateTime?.split('T')[0];
    if (date) {
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
    }
    return acc;
  }, {} as Record<string, TripEvent[]>);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateStr] || [];
  };

  const formatEventTime = (event: TripEvent) => {
    if (event.kind === 'allDay') {
      if (event.startDate === event.endDate || !event.endDate) {
        return formatInTimeZone(new Date(event.startDate!), 'UTC', 'MMM d, yyyy');
      }
      return `${formatInTimeZone(new Date(event.startDate!), 'UTC', 'MMM d, yyyy')} - ${formatInTimeZone(new Date(event.endDate!), 'UTC', 'MMM d, yyyy')}`;
    }
    if (event.kind === 'timed') {
      const start = new Date(event.startDateTime!);
      const end = new Date(event.endDateTime!);
      if (start.toDateString() === end.toDateString()) {
        return `${formatInTimeZone(start, 'UTC', 'HH:mm')} - ${formatInTimeZone(end, 'UTC', 'HH:mm')}`;
      }
      return `${formatInTimeZone(start, 'UTC', 'MMM d, HH:mm')} - ${formatInTimeZone(end, 'UTC', 'MMM d, HH:mm')}`;
    }
    return '';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to workspaces
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
              {trip.description && (
                <p className="text-gray-600 text-sm mt-1">{trip.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {events.length} events • {scheduledEvents.length} scheduled
            </div>
            {trip.isPublic && (
              <Link
                href={`/share/${trip.shareSlug}`}
                className="text-sm text-blue-600 hover:text-blue-800"
                target="_blank"
              >
                View public link →
              </Link>
            )}
            <button
              onClick={togglePublic}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                trip.isPublic 
                  ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200' 
                  : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              }`}
            >
              {trip.isPublic ? 'Make Private' : 'Make Public'}
            </button>
            <button
              onClick={() => setShowEventEditor(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar View */}
        <div className="flex-1 flex flex-col">
          {/* Calendar Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isDragOver = dragOverDate === dateStr;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[120px] border-r border-b border-gray-200 last:border-r-0 p-2 ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
                      onDragOver={(e) => handleDragOver(e, dateStr)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dateStr)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-medium ${
                          isCurrentMonth 
                            ? isToday 
                              ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center' 
                              : 'text-gray-900'
                            : 'text-gray-400'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {isCurrentMonth && (
                          <button
                            onClick={() => {
                              setEditingEvent({
                                _id: 'new' as Id<'tripEvents'>,
                                title: '',
                                kind: 'allDay',
                                startDate: dateStr,
                                endDate: dateStr,
                                createdAt: Date.now(),
                              });
                              setShowEventEditor(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 text-xs"
                          >
                            +
                          </button>
                        )}
                      </div>

                      {/* Events for this day */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event._id}
                            draggable
                            onDragStart={() => handleDragStart(event)}
                            onClick={() => setSelectedEvent(event)}
                            className={`p-1.5 rounded text-xs cursor-pointer transition-colors ${
                              event.kind === 'allDay'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            } ${selectedEvent?._id === event._id ? 'ring-2 ring-blue-500' : ''}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            {event.kind === 'timed' && (
                              <div className="text-xs opacity-75">
                                {formatEventTime(event)}
                              </div>
                            )}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 p-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Unscheduled Events */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Ideas & Unscheduled</h3>
              <span className="text-sm text-gray-500">{unscheduledEvents.length}</span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unscheduledEvents.map((event) => (
                <div
                  key={event._id}
                  draggable
                  onDragStart={() => handleDragStart(event)}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer transition-colors hover:bg-gray-100 ${
                    selectedEvent?._id === event._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900 text-sm">{event.title}</div>
                  {event.notes && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">{event.notes}</div>
                  )}
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className="text-xs text-gray-400 hover:text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event._id);
                      }}
                      className="text-xs text-gray-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {unscheduledEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">💡</div>
                  <p className="text-sm">No ideas yet</p>
                  <p className="text-xs">Drag events here or create new ones</p>
                </div>
              )}
            </div>
          </div>

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
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEvent.kind === 'allDay' ? 'All Day' : 
                       selectedEvent.kind === 'timed' ? 'Timed' : 'Unscheduled'}
                    </span>
                  </div>
                </div>
                
                {selectedEvent.notes && (
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Notes</div>
                    <div className="text-sm text-gray-600">{selectedEvent.notes}</div>
                  </div>
                )}
                
                {selectedEvent.kind !== 'unscheduled' && (
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Schedule</div>
                    <div className="text-sm text-gray-600">{formatEventTime(selectedEvent)}</div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEditEvent(selectedEvent)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  {selectedEvent.kind !== 'unscheduled' && (
                    <button
                      onClick={() => handleUnscheduleEvent(selectedEvent)}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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

      {showEventEditor && (
        <EventEditor
          tripId={tripId}
          event={editingEvent}
          onClose={closeEventEditor}
        />
      )}
    </div>
  );
}
