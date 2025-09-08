'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Id } from '../../../backend/convex/_generated/dataModel';
import EventEditor from './EventEditor';

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

interface TripListViewProps {
  tripId: Id<'trips'>;
}

export default function TripListView({ tripId }: TripListViewProps) {
  const [editingEvent, setEditingEvent] = useState<TripEvent | null>(null);
  const [showEventEditor, setShowEventEditor] = useState(false);
  
  const trip = useQuery(api.trips.getTripById, { tripId });
  const events = useQuery(api.tripEvents.getTripEvents, { tripId });
  const deleteTripEvent = useMutation(api.tripEvents.deleteTripEvent);
  const updateTripEvent = useMutation(api.tripEvents.updateTripEvent);

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

  const handleScheduleEvent = async (event: TripEvent, kind: 'allDay' | 'timed') => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    try {
      if (kind === 'allDay') {
        const tomorrowTimestamp = new Date(tomorrow.toISOString().split('T')[0] + 'T00:00:00').getTime();
        await updateTripEvent({
          eventId: event._id,
          kind: 'allDay',
          startDate: tomorrowTimestamp,
          endDate: tomorrowTimestamp,
        });
      } else {
        const startDateTime = tomorrow.getTime();
        const endDateTime = tomorrow.getTime() + 2 * 60 * 60 * 1000; // +2 hours
        await updateTripEvent({
          eventId: event._id,
          kind: 'timed',
          startDateTime,
          endDateTime,
        });
      }
    } catch (error) {
      console.error('Failed to schedule event:', error);
    }
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

  if (!trip || !events) {
    return <div className="text-center py-8">Loading trip...</div>;
  }

  const scheduledEvents = events.filter((event) => event.kind !== 'unscheduled');
  const unscheduledEvents = events.filter((event) => event.kind === 'unscheduled');

  const formatEventTime = (event: TripEvent) => {
    if (event.kind === 'allDay') {
      if (!event.startDate) return '';
      if (event.startDate === event.endDate || !event.endDate) {
        return formatInTimeZone(new Date(event.startDate), 'UTC', 'MMM d, yyyy');
      }
      return `${formatInTimeZone(new Date(event.startDate), 'UTC', 'MMM d, yyyy')} - ${formatInTimeZone(new Date(event.endDate), 'UTC', 'MMM d, yyyy')}`;
    }
    if (event.kind === 'timed') {
      if (!event.startDateTime || !event.endDateTime) return '';
      const start = new Date(event.startDateTime);
      const end = new Date(event.endDateTime);
      if (start.toDateString() === end.toDateString()) {
        return `${formatInTimeZone(start, 'UTC', 'MMM d, yyyy HH:mm')} - ${formatInTimeZone(end, 'UTC', 'HH:mm')}`;
      }
      return `${formatInTimeZone(start, 'UTC', 'MMM d, yyyy HH:mm')} - ${formatInTimeZone(end, 'UTC', 'MMM d, yyyy HH:mm')}`;
    }
    return '';
  };

  const getEventSortKey = (event: TripEvent): number => {
    if (event.kind === 'allDay' && event.startDate) {
      return event.startDate;
    }
    if (event.kind === 'timed' && event.startDateTime) {
      return event.startDateTime;
    }
    return event.createdAt;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Scheduled Events ({scheduledEvents.length})
            </h2>
          </div>
          
          {scheduledEvents.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">
              <p>No scheduled events yet</p>
              <p className="text-sm mt-1">
                Add dates to events or drag from unscheduled
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledEvents
                .sort((a, b) => getEventSortKey(a) - getEventSortKey(b))
                .map((event) => (
                  <div key={event._id} className="card p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            event.kind === 'allDay' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.kind === 'allDay' ? 'All Day' : 'Timed'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-gray-400 hover:text-blue-600 text-sm px-1"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleUnscheduleEvent(event)}
                          className="text-gray-400 hover:text-yellow-600 text-sm px-1"
                          title="Unschedule"
                        >
                          📅
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-gray-400 hover:text-red-600 text-sm px-1"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {event.notes && (
                      <p className="text-sm text-gray-600 mb-2">{event.notes}</p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {formatEventTime(event)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Unscheduled ({unscheduledEvents.length})
            </h2>
          </div>
          
          {unscheduledEvents.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">
              <p>No unscheduled events</p>
              <p className="text-sm mt-1">
                Create events without dates to brainstorm
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {unscheduledEvents.map((event) => (
                <div key={event._id} className="card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-gray-400 hover:text-blue-600 text-sm px-1"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <div className="relative group">
                        <button
                          className="text-gray-400 hover:text-green-600 text-sm px-1"
                          title="Schedule"
                        >
                          📅
                        </button>
                        <div className="absolute right-0 top-6 bg-white shadow-lg border rounded-lg py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-10 min-w-max">
                          <button
                            onClick={() => handleScheduleEvent(event, 'allDay')}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Schedule as All Day
                          </button>
                          <button
                            onClick={() => handleScheduleEvent(event, 'timed')}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Schedule as Timed
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="text-gray-400 hover:text-red-600 text-sm px-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {event.notes && (
                    <p className="text-sm text-gray-600">{event.notes}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Created {formatInTimeZone(event.createdAt, 'UTC', 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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