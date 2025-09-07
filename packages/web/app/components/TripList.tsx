'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState } from 'react';
import Link from 'next/link';
import { Id } from '../../../backend/convex/_generated/dataModel';

interface TripListProps {
  workspaceId: Id<'workspaces'>;
}

export default function TripList({ workspaceId }: TripListProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const trips = useQuery(api.trips.getWorkspaceTrips, { workspaceId });
  const createTrip = useMutation(api.trips.createTrip);
  const deleteTrip = useMutation(api.trips.deleteTrip);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCreating) return;
    
    setIsCreating(true);
    try {
      await createTrip({ 
        workspaceId, 
        name: name.trim(),
        description: description.trim() || undefined
      });
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create trip:', error);
    }
    setIsCreating(false);
  };

  const handleDeleteTrip = async (tripId: Id<'trips'>) => {
    if (!confirm('Are you sure you want to delete this trip? All events will be lost.')) {
      return;
    }
    
    try {
      await deleteTrip({ tripId });
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  if (!trips) {
    return <div className="text-center py-8">Loading trips...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
        >
          ← Back to workspaces
        </Link>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Trips</h2>
        
        <form onSubmit={handleCreateTrip} className="space-y-4 mb-8 p-4 border border-gray-200 rounded-lg" data-testid="create-trip-form">
          <div>
            <input
              type="text"
              placeholder="Trip name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input w-full"
              disabled={isCreating}
              maxLength={100}
              required
              data-testid="trip-name-input"
              aria-label="Trip name"
            />
          </div>
          <div>
            <textarea
              placeholder="Trip description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea w-full"
              rows={2}
              disabled={isCreating}
              maxLength={500}
              data-testid="trip-description-input"
              aria-label="Trip description"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isCreating || !name.trim()}
            data-testid="create-trip-button"
          >
            {isCreating ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No trips yet
          </h3>
          <p className="text-gray-600">
            Create your first trip to start planning your journey
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="trips-grid">
          {trips.map((trip) => (
            <div key={trip._id} className="card p-6" data-testid={`trip-card-${trip._id}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900" data-testid="trip-title">
                    {trip.name}
                  </h3>
                  {trip.description && (
                    <p className="text-sm text-gray-600 mt-1" data-testid="trip-description">
                      {trip.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTrip(trip._id)}
                  className="text-gray-400 hover:text-red-600 text-sm"
                  title="Delete trip"
                  data-testid={`delete-trip-${trip._id}`}
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <Link
                  href={`/trips/${trip._id}`}
                  className="btn btn-primary w-full text-center block"
                  data-testid={`open-trip-${trip._id}`}
                >
                  Open Trip
                </Link>
                
                {trip.isPublic && (
                  <div className="text-xs text-gray-500">
                    <span className="block mb-1">Public share link:</span>
                    <Link
                      href={`/share/${trip.shareSlug}`}
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      /share/{trip.shareSlug}
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Created {new Date(trip.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}