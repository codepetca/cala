'use client';

import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TripEvent } from '@trip-planner/domain';
import type { DragData } from './dndTypes';
import { useDragClickGuard } from './useDragClickGuard';

interface ItemCardProps {
  event: TripEvent;
  isDragging?: boolean;
  onEdit?: (event: TripEvent) => void;
  onClick?: (event: TripEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface SortableItemCardProps extends ItemCardProps {
  dragData: DragData;
}

// Base ItemCard component (non-sortable)
export const ItemCard = forwardRef<HTMLDivElement, ItemCardProps>(
  ({ event, isDragging = false, onEdit, onClick, className = '', style, ...props }, ref) => {
    const handleCardClick = () => {
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <div
        ref={ref}
        style={style}
        className={`
          card p-3 cursor-grab active:cursor-grabbing
          border-l-4 border-l-blue-400 
          hover:shadow-md hover:scale-[1.01] 
          transition-all duration-200
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        onClick={handleCardClick}
        data-testid={`item-card-${event.id}`}
        {...props}
      >
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
          {event.title}
        </h3>
        
        {event.notes && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {event.notes}
          </p>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded">
            Unscheduled
          </span>
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="text-blue-600 hover:text-blue-800 p-1"
              aria-label={`Edit ${event.title}`}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    );
  }
);

ItemCard.displayName = 'ItemCard';

// Sortable wrapper for drag and drop
export function SortableItemCard({ dragData, onClick, ...props }: SortableItemCardProps) {
  const { onDragStart, onDragEnd, guardClick } = useDragClickGuard();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({
    id: dragData.eventId,
    data: dragData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Create drag-aware listeners
  const dragListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      onDragStart();
      listeners?.onPointerDown?.(e);
    },
  };

  // Handle drag end
  const handleDragEnd = () => {
    onDragEnd();
  };

  // Use effect to listen for drag end
  React.useEffect(() => {
    if (!isDragging) {
      handleDragEnd();
    }
  }, [isDragging]);

  const guardedClick = onClick ? guardClick(() => onClick(props.event)) : undefined;

  return (
    <ItemCard
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      onClick={guardedClick}
      {...attributes}
      {...dragListeners}
      {...props}
    />
  );
}

// Simple display card for read-only contexts
export function DisplayItemCard({ event, className = '' }: { event: TripEvent; className?: string }) {
  return (
    <div
      className={`
        card p-3 border-l-4 border-l-blue-400
        ${className}
      `}
      data-testid={`display-item-${event.id}`}
    >
      <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
        {event.title}
      </h3>
      
      {event.notes && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {event.notes}
        </p>
      )}
    </div>
  );
}