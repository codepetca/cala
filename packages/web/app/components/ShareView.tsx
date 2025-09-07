'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { formatInTimeZone } from 'date-fns-tz';

interface ShareViewProps {
  shareSlug: string;
}

export default function ShareView({ shareSlug }: ShareViewProps) {
  const trip = useQuery(api.trips.getTripByShareSlug, { shareSlug });
  const events = useQuery(api.tripEvents.getTripEventsPublic, { shareSlug });

  // Show loading while queries are undefined (loading)
  if (trip === undefined || events === undefined) {
    return <div className="text-center py-8">Loading trip...</div>;
  }

  // Trip not found or not public
  if (trip === null) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Trip Not Found
        </h1>
        <p className="text-gray-600">
          This trip doesn't exist or is no longer publicly shared.
        </p>
      </div>
    );
  }

  const scheduledEvents = events.filter((event) => event.kind !== 'unscheduled');
  const unscheduledEvents = events.filter((event) => event.kind === 'unscheduled');

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            Public
          </span>
        </div>
        
        {trip.description && (
          <p className="text-gray-600 mb-2">{trip.description}</p>
        )}
        <p className="text-gray-600">
          {events.length} events • {scheduledEvents.length} scheduled • {unscheduledEvents.length} unscheduled
        </p>
        
        <div className="text-xs text-gray-500 mt-2">
          This is a read-only view of a shared trip plan
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Scheduled Events ({scheduledEvents.length})
          </h2>
          
          {scheduledEvents.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">
              <p>No scheduled events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledEvents
                .sort((a, b) => {
                  const aTime = a.kind === 'allDay' ? new Date(a.startDate!).getTime() : new Date(a.startDateTime!).getTime();
                  const bTime = b.kind === 'allDay' ? new Date(b.startDate!).getTime() : new Date(b.startDateTime!).getTime();
                  return aTime - bTime;
                })
                .map((event) => {
                  const formatEventTime = () => {
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
                        return `${formatInTimeZone(start, 'UTC', 'MMM d, yyyy HH:mm')} - ${formatInTimeZone(end, 'UTC', 'HH:mm')}`;
                      }
                      return `${formatInTimeZone(start, 'UTC', 'MMM d, yyyy HH:mm')} - ${formatInTimeZone(end, 'UTC', 'MMM d, yyyy HH:mm')}`;
                    }
                    return '';
                  };
                  
                  return (
                    <div key={event._id} className="card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          event.kind === 'allDay' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {event.kind === 'allDay' ? 'All Day' : 'Timed'}
                        </span>
                      </div>
                      
                      {event.notes && (
                        <p className="text-sm text-gray-600 mb-2">{event.notes}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {formatEventTime()}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Unscheduled ({unscheduledEvents.length})
          </h2>
          
          {unscheduledEvents.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">
              <p>No unscheduled events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unscheduledEvents.map((event) => (
                <div key={event._id} className="card p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  
                  {event.notes && (
                    <p className="text-sm text-gray-600 mb-2">{event.notes}</p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Added {formatInTimeZone(event.createdAt, 'UTC', 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}