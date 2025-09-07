'use client';

import { useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { useState, useRef, useEffect } from 'react';
import { Id } from '../../../backend/convex/_generated/dataModel';

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
}

interface EventEditorProps {
  tripId: Id<'trips'>;
  onClose: () => void;
  event?: TripEvent;
}

export default function EventEditor({ tripId, onClose, event }: EventEditorProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [notes, setNotes] = useState(event?.notes || '');
  const [kind, setKind] = useState<EventKind>(event?.kind || 'unscheduled');
  const [startDate, setStartDate] = useState(event?.startDate || '');
  const [endDate, setEndDate] = useState(event?.endDate || '');
  const [startDateTime, setStartDateTime] = useState(event?.startDateTime || '');
  const [endDateTime, setEndDateTime] = useState(event?.endDateTime || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createTripEvent = useMutation(api.tripEvents.createTripEvent);
  const updateTripEvent = useMutation(api.tripEvents.updateTripEvent);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const eventData: any = {
        tripId,
        title: title.trim(),
        notes: notes.trim() || undefined,
        kind,
      };

      // Add schedule data based on kind
      if (kind === 'allDay') {
        if (startDate) {
          eventData.startDate = startDate;
          eventData.endDate = endDate || startDate;
        }
      } else if (kind === 'timed') {
        if (startDateTime) {
          eventData.startDateTime = startDateTime;
          eventData.endDateTime = endDateTime || startDateTime;
        }
      }

      if (event) {
        await updateTripEvent({
          eventId: event._id,
          ...eventData,
        });
      } else {
        await createTripEvent(eventData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
    setStartDateTime('');
    setEndDateTime('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {event ? 'Edit Event' : 'New Event'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Title *
              </label>
              <input
                ref={titleRef}
                id="title"
                type="text"
                className="form-input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="kind" className="form-label">
                Kind *
              </label>
              <select
                id="kind"
                className="form-input w-full"
                value={kind}
                onChange={(e) => setKind(e.target.value as EventKind)}
                disabled={isSubmitting}
              >
                <option value="unscheduled">Unscheduled</option>
                <option value="allDay">All Day</option>
                <option value="timed">Timed</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                className="form-textarea w-full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                placeholder="Optional details about this event..."
              />
            </div>

            {kind === 'allDay' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="form-label mb-0">All Day Event Dates</label>
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={handleClearDates}
                      className="text-sm text-blue-600 hover:text-blue-800"
                      disabled={isSubmitting}
                    >
                      Clear dates
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      className="form-input w-full text-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      className="form-input w-full text-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Event will run for the entire day(s) specified
                </p>
              </div>
            )}

            {kind === 'timed' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="form-label mb-0">Timed Event Schedule</label>
                  {(startDateTime || endDateTime) && (
                    <button
                      type="button"
                      onClick={handleClearDates}
                      className="text-sm text-blue-600 hover:text-blue-800"
                      disabled={isSubmitting}
                    >
                      Clear times
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startDateTime" className="block text-xs text-gray-600 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      id="startDateTime"
                      type="datetime-local"
                      className="form-input w-full text-sm"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDateTime" className="block text-xs text-gray-600 mb-1">
                      End Date & Time
                    </label>
                    <input
                      id="endDateTime"
                      type="datetime-local"
                      className="form-input w-full text-sm"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      min={startDateTime || undefined}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Event will have specific start and end times
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}