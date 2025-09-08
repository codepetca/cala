'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { AllDayEvent } from '@trip-planner/domain';
import { SortableChipCard, OverflowChip } from './ChipCard';
import { createAllDayDragData } from './dndTypes';

interface AllDayLaneProps {
  date: string; // YYYY-MM-DD
  events: AllDayEvent[];
  maxVisible?: number;
  onEdit?: (event: AllDayEvent) => void;
  onAdd?: () => void;
  className?: string;
}

export function AllDayLane({ 
  date, 
  events, 
  maxVisible = 3,
  onEdit, 
  onAdd,
  className = '' 
}: AllDayLaneProps) {
  const [showOverflow, setShowOverflow] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `allday-${date}`,
    data: {
      type: 'allday',
      date
    }
  });

  const visibleEvents = events.slice(0, maxVisible);
  const overflowEvents = events.slice(maxVisible);
  const hasOverflow = overflowEvents.length > 0;

  const eventIds = events.map(event => event.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[44px] p-2 border-b border-gray-100
        ${isOver ? 'bg-purple-50 border-purple-300' : 'bg-gray-50'}
        transition-colors duration-200
        ${className}
      `}
      data-testid={`allday-lane-${date}`}
    >
      <div className="flex flex-wrap gap-2">
        {events.length === 0 ? (
          <EmptyAllDayLane 
            onAdd={onAdd}
            isHighlighted={isOver}
          />
        ) : (
          <SortableContext items={eventIds} strategy={horizontalListSortingStrategy}>
            {/* Visible events */}
            {visibleEvents.map((event) => (
              <SortableChipCard
                key={event.id}
                event={event}
                dragData={createAllDayDragData(event, date)}
                onEdit={onEdit}
              />
            ))}

            {/* Overflow indicator */}
            {hasOverflow && (
              <OverflowChip
                count={overflowEvents.length}
                onClick={() => setShowOverflow(true)}
              />
            )}
          </SortableContext>
        )}
      </div>

      {/* Drop feedback overlay */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-purple-400 bg-purple-50/50 rounded pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
              Drop for all-day event
            </div>
          </div>
        </div>
      )}

      {/* Overflow modal/popover */}
      {showOverflow && hasOverflow && (
        <OverflowModal
          events={overflowEvents}
          date={date}
          onClose={() => setShowOverflow(false)}
          onEdit={onEdit}
          onClick={onClick}
        />
      )}
    </div>
  );
}

// Empty state for all-day lane
function EmptyAllDayLane({ 
  onAdd, 
  isHighlighted 
}: { 
  onAdd?: () => void;
  isHighlighted: boolean;
}) {
  if (isHighlighted) {
    return (
      <div className="flex items-center text-purple-600 text-sm">
        <PlusIcon className="w-4 h-4 mr-1" />
        <span>Drop here for all-day event</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-gray-500 text-sm">
      {onAdd ? (
        <button
          onClick={onAdd}
          className="flex items-center hover:text-gray-700 transition-colors"
          data-testid={`add-allday-event-button`}
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          <span>+ Add</span>
        </button>
      ) : (
        <>
          <span className="text-gray-400">No all-day events</span>
        </>
      )}
    </div>
  );
}

// Modal/popover for overflow events
function OverflowModal({
  events,
  date,
  onClose,
  onEdit,
  onClick
}: {
  events: AllDayEvent[];
  date: string;
  onClose: () => void;
  onEdit?: (event: AllDayEvent) => void;
  onClick?: (event: AllDayEvent) => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900">
            All-day events ({events.length + 3})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {events.map((event) => (
            <SortableChipCard
              key={event.id}
              event={event}
              dragData={createAllDayDragData(event, date)}
              onEdit={onEdit}
              onClick={onClick}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Icon components
function PlusIcon({ className = '' }: { className?: string }) {
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
        d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg 
      width="20" 
      height="20" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  );
}