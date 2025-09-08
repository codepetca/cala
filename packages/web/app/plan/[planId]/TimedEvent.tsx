'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TimedEvent } from '@trip-planner/domain';
import { 
  msToPosition, 
  durationToHeight, 
  formatTime, 
  snap,
  HOUR_HEIGHT 
} from './timeMath';
import { createTimeGridDragData } from './dndTypes';
import { useDragClickGuard } from './useDragClickGuard';

interface TimedEventProps {
  event: TimedEvent;
  date: string; // YYYY-MM-DD
  onEdit?: (event: TimedEvent) => void;
  onClick?: (event: TimedEvent) => void;
  onResize?: (eventId: string, newStart: number, newEnd: number) => void;
  overlapsCount?: number;
  className?: string;
}

export function TimedEventComponent({ 
  event, 
  date,
  onEdit, 
  onClick,
  onResize,
  overlapsCount = 0,
  className = '' 
}: TimedEventProps) {
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null);
  const [resizeStart, setResizeStart] = useState<{ y: number; originalStart: number; originalEnd: number } | null>(null);
  
  const { onDragStart, onDragEnd, guardClick } = useDragClickGuard();

  // Calculate position and dimensions
  const { top, height } = useMemo(() => ({
    top: msToPosition(event.startDateTime.getTime()),
    height: durationToHeight(event.endDateTime.getTime() - event.startDateTime.getTime())
  }), [event.startDateTime, event.endDateTime]);

  // Create drag data
  const dragData = useMemo(() => createTimeGridDragData(
    event, 
    date, 
    event.startDateTime.getTime(), 
    event.endDateTime.getTime()
  ), [event, date]);

  // Sortable setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: event.id,
    data: dragData,
  });

  // Create drag-aware listeners
  const dragListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      if (isResizing) return; // Don't start drag during resize
      onDragStart();
      listeners?.onPointerDown?.(e);
    },
  };

  // Handle drag end
  React.useEffect(() => {
    if (!isDragging) {
      onDragEnd();
    }
  }, [isDragging, onDragEnd]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Resize handlers
  const handleResizeStart = useCallback((handle: 'top' | 'bottom', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(handle);
    setResizeStart({
      y: e.clientY,
      originalStart: event.startDateTime.getTime(),
      originalEnd: event.endDateTime.getTime()
    });
  }, [event.startDateTime, event.endDateTime]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStart || !onResize) return;

    const deltaY = e.clientY - resizeStart.y;
    const deltaMs = (deltaY / HOUR_HEIGHT) * (60 * 60 * 1000);
    const isAltPressed = e.altKey;

    let newStart = resizeStart.originalStart;
    let newEnd = resizeStart.originalEnd;

    if (isResizing === 'top') {
      newStart = snap(resizeStart.originalStart + deltaMs, isAltPressed);
      // Ensure minimum 15-minute duration
      if (newStart >= newEnd - (15 * 60 * 1000)) {
        newStart = newEnd - (15 * 60 * 1000);
      }
    } else {
      newEnd = snap(resizeStart.originalEnd + deltaMs, isAltPressed);
      // Ensure minimum 15-minute duration
      if (newEnd <= newStart + (15 * 60 * 1000)) {
        newEnd = newStart + (15 * 60 * 1000);
      }
    }

    onResize(event.id, newStart, newEnd);
  }, [isResizing, resizeStart, onResize, event.id]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    setResizeStart(null);
  }, []);

  // Resize event listeners
  React.useEffect(() => {
    if (!isResizing) return;

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const hasOverlaps = overlapsCount > 0;
  const showDuration = height >= 40; // Show duration if tall enough
  
  const handleCardClick = () => {
    if (onClick && !isResizing) {
      onClick(event);
    }
  };
  
  const guardedClick = onClick ? guardClick(handleCardClick) : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        top: `${top}px`,
        height: `${Math.max(height, 30)}px`, // Minimum height
      }}
      className={`
        absolute left-2 right-2 z-10
        bg-green-100 border border-green-300 rounded-lg
        cursor-grab active:cursor-grabbing
        hover:shadow-md hover:z-20
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95 z-30' : ''}
        ${hasOverlaps ? 'ring-2 ring-yellow-400' : ''}
        ${isResizing ? 'select-none' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={guardedClick}
      data-testid={`timed-event-${event.id}`}
      {...attributes}
      {...dragListeners}
    >
      {/* Top resize handle */}
      <div
        className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-green-300 rounded-t-lg"
        onMouseDown={(e) => handleResizeStart('top', e)}
        data-testid={`resize-handle-top-${event.id}`}
      />

      {/* Event content */}
      <div className="p-2 h-full flex flex-col justify-between text-green-800">
        <div className="flex-1 min-h-0">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">
            {event.title}
          </h4>
          {height >= 60 && event.notes && (
            <p className="text-xs opacity-75 line-clamp-2">
              {event.notes}
            </p>
          )}
        </div>
        
        {showDuration && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span>{formatTime(event.startDateTime.getTime())}</span>
            <span>{formatTime(event.endDateTime.getTime())}</span>
          </div>
        )}

        {/* Overlap indicator */}
        {hasOverlaps && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {overlapsCount}
          </div>
        )}

        {/* Edit button */}
        {onEdit && height >= 50 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            className="absolute top-1 right-1 text-green-600 hover:text-green-800 opacity-75 hover:opacity-100"
            aria-label={`Edit ${event.title}`}
          >
            <EditIcon />
          </button>
        )}
      </div>

      {/* Bottom resize handle */}
      <div
        className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-green-300 rounded-b-lg"
        onMouseDown={(e) => handleResizeStart('bottom', e)}
        data-testid={`resize-handle-bottom-${event.id}`}
      />
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

// Display-only version for read-only contexts
export function DisplayTimedEvent({ 
  event, 
  className = '' 
}: { 
  event: TimedEvent; 
  className?: string;
}) {
  const top = msToPosition(event.startDateTime.getTime());
  const height = durationToHeight(event.endDateTime.getTime() - event.startDateTime.getTime());
  const showDuration = height >= 40;

  return (
    <div
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 30)}px`,
      }}
      className={`
        absolute left-2 right-2
        bg-green-100 border border-green-300 rounded-lg
        ${className}
      `}
      data-testid={`display-timed-event-${event.id}`}
    >
      <div className="p-2 h-full flex flex-col justify-between text-green-800">
        <div className="flex-1 min-h-0">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">
            {event.title}
          </h4>
          {height >= 60 && event.notes && (
            <p className="text-xs opacity-75 line-clamp-2">
              {event.notes}
            </p>
          )}
        </div>
        
        {showDuration && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span>{formatTime(event.startDateTime.getTime())}</span>
            <span>{formatTime(event.endDateTime.getTime())}</span>
          </div>
        )}
      </div>
    </div>
  );
}