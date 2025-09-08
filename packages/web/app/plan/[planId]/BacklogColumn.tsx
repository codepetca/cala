'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { UnscheduledEvent } from '@trip-planner/domain';
import { SortableItemCard } from './ItemCard';
import { createBacklogDragData } from './dndTypes';

interface BacklogColumnProps {
  events: UnscheduledEvent[];
  onEdit?: (event: UnscheduledEvent) => void;
  onClick?: (event: UnscheduledEvent) => void;
  onAdd?: () => void;
  className?: string;
}

export function BacklogColumn({ 
  events, 
  onEdit, 
  onClick,
  onAdd, 
  className = '' 
}: BacklogColumnProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog',
    data: {
      type: 'backlog'
    }
  });

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.notes && event.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const eventIds = filteredEvents.map(event => event.id);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Ideas & Backlog
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {filteredEvents.length}
          </span>
        </div>
        
        {/* Search/Filter */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 text-sm"
            data-testid="backlog-search"
          />
        </div>
        
        {/* Add button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="w-full mt-3 btn btn-secondary text-sm"
            data-testid="add-idea-button"
          >
            + Add
          </button>
        )}
      </div>

      {/* Droppable content area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-4 space-y-3 overflow-y-auto
          ${isOver ? 'bg-blue-50 border-blue-300' : ''}
          transition-colors duration-200
        `}
        data-testid="backlog-drop-zone"
      >
        {filteredEvents.length === 0 ? (
          <EmptyState 
            hasSearch={searchTerm.length > 0}
            searchTerm={searchTerm}
            onAdd={onAdd}
          />
        ) : (
          <SortableContext items={eventIds} strategy={verticalListSortingStrategy}>
            {filteredEvents.map((event) => (
              <SortableItemCard
                key={event.id}
                event={event}
                dragData={createBacklogDragData(event)}
                onEdit={onEdit}
                onClick={onClick}
              />
            ))}
          </SortableContext>
        )}
      </div>

      {/* Drop feedback */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50/50 rounded-lg pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
              Drop here to unschedule
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Empty state component
function EmptyState({ 
  hasSearch, 
  searchTerm, 
  onAdd 
}: { 
  hasSearch: boolean; 
  searchTerm: string; 
  onAdd?: () => void;
}) {
  if (hasSearch) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <SearchIcon className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-gray-600 mb-1">No ideas match "{searchTerm}"</p>
        <p className="text-sm text-gray-500">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <LightbulbIcon className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-gray-600 font-medium mb-2">No ideas yet</h3>
      <p className="text-sm text-gray-500 mb-4">
        Add ideas and activities to your backlog, then drag them to schedule
      </p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="btn btn-primary"
          data-testid="empty-add-idea-button"
        >
          + Add
        </button>
      )}
    </div>
  );
}

// Icon components
function SearchIcon({ className = '' }: { className?: string }) {
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
        d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
      />
    </svg>
  );
}

function LightbulbIcon({ className = '' }: { className?: string }) {
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
        strokeWidth={1.5} 
        d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
      />
    </svg>
  );
}