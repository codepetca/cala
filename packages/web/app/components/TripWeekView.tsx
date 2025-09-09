'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, format, startOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Id } from '../../../backend/convex/_generated/dataModel';
import EventEditor from './EventEditor';
// Removed DayColumn dependency due to type conflicts - simplified week view

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

interface TripWeekViewProps {
  tripId: Id<'trips'>;
}

export default function TripWeekView({ tripId }: TripWeekViewProps) {
  const [editingEvent, setEditingEvent] = useState<TripEvent | null>(null);
  const [showEventEditor, setShowEventEditor] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<TripEvent | null>(null);
  
  const trip = useQuery(api.trips.getTripById, { tripId });
  const events = useQuery(api.tripEvents.getTripEvents, { tripId });
  const deleteTripEvent = useMutation(api.tripEvents.deleteTripEvent);
  const updateTripEvent = useMutation(api.tripEvents.updateTripEvent);

  // Week calculations
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  const handleEventResize = async (eventId: string, newStart: number, newEnd: number) => {
    try {
      const event = events?.find(e => e._id === eventId);
      if (!event) return;

      if (event.kind === 'timed') {
        await updateTripEvent({
          eventId: event._id,
          startDateTime: newStart,
          endDateTime: newEnd,
        });
      }
    } catch (error) {
      console.error('Failed to resize event:', error);
    }
  };

  if (!trip || !events) {
    return <div className="text-center py-8">Loading trip...</div>;
  }

  const scheduledEvents = events.filter((event) => event.kind !== 'unscheduled');
  const unscheduledEvents = events.filter((event) => event.kind === 'unscheduled');

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
        if (!acc[date]) acc[date] = { allDay: [], timed: [] };
        if (event.kind === 'allDay') {
          acc[date].allDay.push(event);
        } else if (event.kind === 'timed') {
          acc[date].timed.push(event);
        }
      }
      return acc;
    }, {} as Record<string, { allDay: TripEvent[], timed: TripEvent[] }>);
  }, [scheduledEvents]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventsByDate[dateStr] || { allDay: [], timed: [] };
  };

  return (
    <div className="h-screen flex flex-col bg-muted/50">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Week View */}
        <div className="flex-1 flex flex-col">
          {/* Week Header */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">
                Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentWeek(new Date())}
                  className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  This Week
                </button>
                <button
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Week Grid */}
          <div className="flex-1 overflow-auto bg-card">
            <div className="flex h-full min-w-[800px]">
              {/* Time column */}
              <div className="w-16 border-r border-border bg-muted/50">
                <div className="h-16 border-b border-border"></div> {/* Header spacer */}
                {Array.from({ length: 24 }, (_, hour) => (
                  <div 
                    key={hour} 
                    className="h-16 border-b border-border px-2 py-1 text-xs text-muted-foreground flex items-start"
                  >
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                ))}
              </div>

              {/* Days */}
              {weekDays.map((day) => {
                const dayEvents = getEventsForDate(day);
                const dateStr = format(day, 'yyyy-MM-dd');
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={day.toISOString()} className="flex-1 border-r border-border last:border-r-0">
                    {/* Day header */}
                    <div className={`h-16 border-b border-border p-2 text-center ${
                      isToday ? 'bg-blue-50' : ''
                    }`}>
                      <div className={`text-sm font-medium ${
                        isToday ? 'text-blue-700' : 'text-muted-foreground'
                      }`}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-lg font-semibold ${
                        isToday ? 'text-blue-900' : 'text-foreground'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>

                    {/* All-day events */}
                    <div className="border-b border-border p-2 bg-muted/50 min-h-[60px]">
                      {dayEvents.allDay.slice(0, 2).map((event) => (
                        <div
                          key={event._id}
                          onClick={() => setSelectedEvent(event)}
                          className="mb-1 p-1 text-xs bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 truncate"
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.allDay.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.allDay.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Time slots */}
                    <div className="relative">
                      {Array.from({ length: 24 }, (_, hour) => (
                        <div 
                          key={hour} 
                          className="h-16 border-b border-border relative group hover:bg-accent"
                        >
                          {/* Timed events for this hour */}
                          {dayEvents.timed
                            .filter(event => {
                              if (!event.startDateTime) return false;
                              const eventHour = new Date(event.startDateTime).getHours();
                              return eventHour === hour;
                            })
                            .map((event) => (
                              <div
                                key={event._id}
                                onClick={() => setSelectedEvent(event)}
                                className="absolute left-1 right-1 top-1 p-1 text-xs bg-green-100 text-green-800 rounded cursor-pointer hover:bg-green-200 truncate z-10"
                                style={{
                                  height: `${Math.min((event.endDateTime! - event.startDateTime!) / (60 * 60 * 1000) * 64 - 4, 60)}px`
                                }}
                              >
                                {event.title}
                                <div className="text-xs opacity-75">
                                  {formatInTimeZone(new Date(event.startDateTime!), 'UTC', 'HH:mm')} - 
                                  {formatInTimeZone(new Date(event.endDateTime!), 'UTC', 'HH:mm')}
                                </div>
                              </div>
                            ))}
                          
                          {/* Quick add button on hover */}
                          <button
                            onClick={() => {
                              const startTime = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:00:00`).getTime();
                              const endTime = new Date(`${dateStr}T${(hour + 1).toString().padStart(2, '0')}:00:00`).getTime();
                              setEditingEvent({
                                _id: 'new' as Id<'tripEvents'>,
                                title: '',
                                kind: 'timed',
                                startDateTime: startTime,
                                endDateTime: endTime,
                                createdAt: Date.now(),
                              });
                              setShowEventEditor(true);
                            }}
                            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 w-4 h-4 bg-blue-500 text-white rounded text-xs flex items-center justify-center hover:bg-blue-600"
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar with unscheduled events */}
        <div className="w-80 bg-card border-l border-border flex flex-col">
          {/* Unscheduled Events */}
          <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-foreground">Ideas & Unscheduled</h3>
              <span className="text-sm text-muted-foreground">{unscheduledEvents.length}</span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unscheduledEvents.map((event) => (
                <div
                  key={event._id}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-3 bg-muted/50 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors ${
                    selectedEvent?._id === event._id ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  }`}
                >
                  <div className="font-medium text-sm truncate">{event.title}</div>
                  {event.notes && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.notes}</div>
                  )}
                </div>
              ))}
              
              {unscheduledEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">💡</div>
                  <p className="text-sm">No ideas yet</p>
                  <p className="text-xs">Create events to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          {selectedEvent && (
            <div className="flex-1 p-4">
              <h3 className="font-semibold text-foreground mb-3">Event Details</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{selectedEvent.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      selectedEvent.kind === 'allDay' 
                        ? 'bg-blue-100 text-blue-800' 
                        : selectedEvent.kind === 'timed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-secondary text-foreground'
                    }`}>
                      {selectedEvent.kind === 'allDay' ? 'All Day' : 
                       selectedEvent.kind === 'timed' ? 'Timed' : 'Unscheduled'}
                    </span>
                  </div>
                </div>
                
                {selectedEvent.notes && (
                  <div>
                    <div className="text-xs font-medium text-foreground mb-1">Notes</div>
                    <div className="text-sm text-muted-foreground">{selectedEvent.notes}</div>
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
                      className="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:bg-secondary/80 transition-colors"
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