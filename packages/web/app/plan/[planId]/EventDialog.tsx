'use client';

import React, { useState, useCallback } from 'react';
import { Modal } from './Modal';
import type { TripEvent } from '@trip-planner/domain';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: { title: string; notes?: string }) => void;
  initialData?: Pick<TripEvent, 'title' | 'notes'>;
  isLoading?: boolean;
}

export function EventDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  isLoading = false 
}: EventDialogProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [titleError, setTitleError] = useState('');

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setNotes(initialData?.notes || '');
      setTitleError('');
    }
  }, [isOpen, initialData]);

  // Validate form
  const validateForm = useCallback(() => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }
    if (title.length > 100) {
      setTitleError('Title must be 100 characters or less');
      return false;
    }
    setTitleError('');
    return true;
  }, [title]);

  // Handle form submission
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      title: title.trim(),
      notes: notes.trim() || undefined
    });
  }, [title, notes, validateForm, onSave]);

  // Handle Enter key in form
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleSubmit(event as any);
    }
  }, [handleSubmit]);

  // Close handler
  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [onClose, isLoading]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit Event' : 'Create Event'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label htmlFor="event-title" className="form-label">
            Title *
          </label>
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`form-input ${titleError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="What's the plan?"
            disabled={isLoading}
            autoFocus
            maxLength={100}
            data-testid="event-title-input"
          />
          {titleError && (
            <p className="mt-1 text-sm text-red-600" data-testid="title-error">
              {titleError}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {title.length}/100 characters
          </p>
        </div>

        {/* Notes Field */}
        <div>
          <label htmlFor="event-notes" className="form-label">
            Notes
          </label>
          <textarea
            id="event-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            className="form-textarea"
            placeholder="Add any additional details..."
            rows={3}
            disabled={isLoading}
            maxLength={2000}
            data-testid="event-notes-input"
          />
          <p className="mt-1 text-xs text-gray-500">
            {notes.length}/2000 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="btn btn-secondary"
            data-testid="event-dialog-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="btn btn-primary min-w-[80px] flex items-center justify-center"
            data-testid="event-dialog-save"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              initialData ? 'Update' : 'Create'
            )}
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-xs text-gray-400 text-center">
          Press Cmd/Ctrl + Enter to save
        </div>
      </form>
    </Modal>
  );
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}