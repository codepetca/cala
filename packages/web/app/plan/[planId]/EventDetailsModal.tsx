'use client';

import React, { useState, useCallback } from 'react';
import { Modal } from './Modal';
import type { TripEvent } from '@trip-planner/domain';
import { formatTime } from './timeMath';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  event: TripEvent | null;
  isLoading?: boolean;
}

export function EventDetailsModal({ 
  isOpen, 
  onClose, 
  onEdit,
  onDelete,
  event,
  isLoading = false 
}: EventDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = useCallback(() => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  }, [showDeleteConfirm, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit();
  }, [onEdit]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setShowDeleteConfirm(false);
      onClose();
    }
  }, [onClose, isLoading]);

  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={event.title}
      size="md"
    >
      <div className="space-y-6">
        {/* Event Details */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {event.title}
            </h3>
            <EventKindBadge event={event} />
          </div>

          {/* Scheduling Info */}
          <EventScheduleInfo event={event} />

          {/* Notes */}
          {event.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <div 
                className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md"
                data-testid="event-notes-display"
              >
                {event.notes}
              </div>
            </div>
          )}

          {/* Metadata */}
          <EventMetadata event={event} />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                data-testid="delete-event-button"
              >
                Delete Event
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
                  data-testid="confirm-delete-button"
                >
                  {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-700 text-sm transition-colors"
                  data-testid="cancel-delete-button"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="btn btn-secondary"
              data-testid="event-details-close"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleEdit}
              disabled={isLoading}
              className="btn btn-primary"
              data-testid="edit-event-button"
            >
              Edit Event
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function EventKindBadge({ event }: { event: TripEvent }) {
  const badgeStyles = {
    unscheduled: 'bg-gray-100 text-gray-700',
    allDay: 'bg-blue-100 text-blue-700',
    timed: 'bg-green-100 text-green-700'
  };

  const badgeLabels = {
    unscheduled: 'Idea',
    allDay: 'All Day',
    timed: 'Scheduled'
  };

  return (
    <span 
      className={`inline-block px-2 py-1 text-xs font-medium rounded ${badgeStyles[event.kind]}`}
      data-testid="event-kind-badge"
    >
      {badgeLabels[event.kind]}
    </span>
  );
}

function EventScheduleInfo({ event }: { event: TripEvent }) {
  if (event.kind === 'unscheduled') {
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule</h4>
        <p className="text-sm text-gray-600">Not scheduled - in backlog</p>
      </div>
    );
  }

  if (event.kind === 'allDay') {
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    };

    return (
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule</h4>
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1 mb-1">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span>
              {formatDate(startDate)}
              {endDate && !isSameDay(startDate, endDate) && (
                <span> - {formatDate(endDate)}</span>
              )}
            </span>
          </div>
          <div className="text-xs text-gray-500">All day event</div>
        </div>
      </div>
    );
  }

  if (event.kind === 'timed') {
    const startDateTime = new Date(event.startDateTime);
    const endDateTime = new Date(event.endDateTime);
    
    const formatDateTime = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    };

    const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours === 0) return `${mins}m`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}m`;
    };

    return (
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span>{formatDateTime(startDateTime)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span>
              {formatTime(startDateTime)} - {formatTime(endDateTime)}
              <span className="text-gray-500 ml-2">({formatDuration(duration)})</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function EventMetadata({ event }: { event: TripEvent }) {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="text-xs text-gray-500 border-t pt-3">
      <div className="flex justify-between">
        <span>Created: {formatTimestamp(event.createdAt)}</span>
        <span>Updated: {formatTimestamp(event.updatedAt)}</span>
      </div>
    </div>
  );
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={className}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
      />
    </svg>
  );
}

function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={className}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  );
}