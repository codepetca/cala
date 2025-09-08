'use client';

import TripMonthView from '../../components/TripMonthViewDnD';
import TripListView from '../../components/TripListView';
import TripWeekView from '../../components/TripWeekView';
import EventEditor from '../../components/EventEditor';
import { Id } from '../../../../backend/convex/_generated/dataModel';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../backend/convex/_generated/api';
import { useState } from 'react';
import Link from 'next/link';

type ViewType = 'month' | 'list' | 'week';

export default function TripPage({ 
  params 
}: { 
  params: { tripId: string } 
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = (searchParams.get('view') as ViewType) || 'month';
  const tripId = params.tripId as Id<'trips'>;
  const [showEventEditor, setShowEventEditor] = useState(false);
  
  const trip = useQuery(api.trips.getTripById, { tripId });
  const events = useQuery(api.tripEvents.getTripEvents, { tripId });
  const updateTrip = useMutation(api.trips.updateTrip);

  const handleViewChange = (newView: ViewType) => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    router.push(url.pathname + url.search);
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

  if (!trip || !events) {
    return <div className="text-center py-8">Loading trip...</div>;
  }

  const ViewComponent = view === 'month' ? TripMonthView : view === 'week' ? TripWeekView : TripListView;

  return (
    <div className="min-h-screen bg-gray-50">
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
              {events.length} events
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

        {/* View Toggle */}
        <div className="mt-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => handleViewChange('month')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                view === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleViewChange('list')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                view === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => handleViewChange('week')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                view === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <ViewComponent tripId={tripId} />

      {/* Event Editor Modal */}
      {showEventEditor && (
        <EventEditor
          tripId={tripId}
          onClose={() => setShowEventEditor(false)}
        />
      )}
    </div>
  );
}