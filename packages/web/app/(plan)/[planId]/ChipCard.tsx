'use client';

import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AllDayEvent } from '@trip-planner/domain';
import type { DragData } from './dndTypes';

interface ChipCardProps {
  event: AllDayEvent;
  isDragging?: boolean;
  isOverflow?: boolean;
  onEdit?: (event: AllDayEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface SortableChipCardProps extends ChipCardProps {
  dragData: DragData;
}

// Base ChipCard component (non-sortable)
export const ChipCard = forwardRef<HTMLDivElement, ChipCardProps>(
  ({ event, isDragging = false, isOverflow = false, onEdit, className = '', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 
          bg-purple-100 text-purple-800 rounded-full text-sm
          border border-purple-200 cursor-grab active:cursor-grabbing
          hover:bg-purple-200 hover:shadow-sm
          transition-all duration-200
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${isOverflow ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}
          ${className}
        `}
        data-testid={`chip-card-${event.id}`}
        {...props}
      >
        <span className="font-medium truncate max-w-32">
          {event.title}
        </span>
        
        {onEdit && !isOverflow && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            className="text-purple-600 hover:text-purple-800 ml-1 p-0.5"
            aria-label={`Edit ${event.title}`}
          >
            <EditIcon />
          </button>
        )}
      </div>
    );
  }
);

ChipCard.displayName = 'ChipCard';

// Sortable wrapper for drag and drop
export function SortableChipCard({ dragData, ...props }: SortableChipCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dragData.eventId,
    data: dragData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ChipCard
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
      {...props}
    />
  );
}

// Overflow indicator chip showing "+N more"
export function OverflowChip({ 
  count, 
  onClick,
  className = '' 
}: { 
  count: number; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`
        inline-flex items-center px-3 py-1.5
        bg-gray-100 text-gray-600 rounded-full text-sm
        border border-gray-200 cursor-pointer
        hover:bg-gray-200 hover:shadow-sm
        transition-all duration-200
        ${className}
      `}
      onClick={onClick}
      data-testid="overflow-chip"
    >
      <span className="font-medium">
        +{count} more
      </span>
    </div>
  );
}

// Simple display chip for read-only contexts
export function DisplayChipCard({ 
  event, 
  className = '' 
}: { 
  event: AllDayEvent; 
  className?: string;
}) {
  return (
    <div
      className={`
        inline-flex items-center px-3 py-1.5
        bg-purple-100 text-purple-800 rounded-full text-sm
        border border-purple-200
        ${className}
      `}
      data-testid={`display-chip-${event.id}`}
    >
      <span className="font-medium truncate max-w-32">
        {event.title}
      </span>
    </div>
  );
}

// Small edit icon component
function EditIcon() {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}