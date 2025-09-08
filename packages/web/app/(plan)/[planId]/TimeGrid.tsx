'use client';

import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TimedEvent } from '@trip-planner/domain';
import { TimedEventComponent } from './TimedEvent';
import { 
  getHourLines, 
  getCurrentTimePosition, 
  HOUR_HEIGHT,
  msToPosition,
  snap,
  positionToMs
} from './timeMath';
import type { DragData } from './dndTypes';

interface TimeGridProps {
  date: string; // YYYY-MM-DD
  events: TimedEvent[];
  onEventEdit?: (event: TimedEvent) => void;
  onEventResize?: (eventId: string, newStart: number, newEnd: number) => void;
  className?: string;
}

interface TimeSlotDropZone {
  id: string;
  startTime: number;
  endTime: number;
  position: number;
  height: number;
}

export function TimeGrid({ 
  date, 
  events, 
  onEventEdit, 
  onEventResize, 
  className = '' 
}: TimeGridProps) {
  const hourLines = useMemo(() => getHourLines(), []);
  const currentTimePosition = useMemo(() => getCurrentTimePosition(), []);
  
  // Create 30-minute drop zones
  const dropZones = useMemo((): TimeSlotDropZone[] => {
    const zones: TimeSlotDropZone[] = [];
    const baseDate = new Date(date + 'T00:00:00');
    
    for (let hour = 8; hour < 20; hour++) {
      for (let half = 0; half < 2; half++) {
        const startMinutes = half * 30;
        const startTime = new Date(baseDate);
        startTime.setHours(hour, startMinutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startMinutes + 30);
        
        zones.push({
          id: `${date}-${hour}-${half}`,
          startTime: startTime.getTime(),
          endTime: endTime.getTime(),
          position: msToPosition(startTime.getTime()),
          height: HOUR_HEIGHT / 2
        });
      }
    }
    
    return zones;
  }, [date]);

  return (
    <div 
      className={`relative bg-white ${className}`}
      style={{ height: `${(20 - 8) * HOUR_HEIGHT}px` }}
      data-testid={`time-grid-${date}`}
    >
      {/* Hour lines */}
      {hourLines.map((line) => (
        <HourLine 
          key={line.hour}
          hour={line.hour}
          label={line.label}
          position={line.position}
          isCurrentHour={currentTimePosition !== null && 
            Math.abs(currentTimePosition - line.position) < HOUR_HEIGHT}
        />
      ))}

      {/* Current time indicator */}
      {currentTimePosition !== null && (
        <div
          className="absolute left-0 right-0 z-20 border-t-2 border-red-500"
          style={{ top: `${currentTimePosition}px` }}
        >
          <div className="absolute -left-2 -top-1 w-4 h-2 bg-red-500 rounded-full" />
        </div>
      )}

      {/* Drop zones */}
      {dropZones.map((zone) => (
        <TimeSlotDropZone
          key={zone.id}
          zone={zone}
          date={date}
        />
      ))}

      {/* Timed events */}
      {events.map((event) => (
        <TimedEventComponent
          key={event.id}
          event={event}
          date={date}
          onEdit={onEventEdit}
          onResize={onEventResize}
        />
      ))}
    </div>
  );
}

// Individual hour line component
function HourLine({ 
  hour, 
  label, 
  position, 
  isCurrentHour 
}: { 
  hour: number; 
  label: string; 
  position: number;
  isCurrentHour: boolean;
}) {
  return (
    <div
      className={`
        absolute left-0 right-0 border-t border-dashed
        ${isCurrentHour ? 'border-red-300' : 'border-gray-200'}
      `}
      style={{ top: `${position}px` }}
    >
      <span 
        className={`
          absolute -left-16 -top-2 text-xs w-14 text-right
          ${isCurrentHour ? 'text-red-600 font-medium' : 'text-gray-500'}
        `}
      >
        {label}
      </span>
    </div>
  );
}

// Individual drop zone component
function TimeSlotDropZone({ 
  zone, 
  date 
}: { 
  zone: TimeSlotDropZone; 
  date: string;
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: zone.id,
    data: {
      type: 'timegrid',
      date,
      startTime: zone.startTime,
      endTime: zone.endTime
    }
  });

  // Show preview when dragging
  const showPreview = isOver && active;
  const dragData = active?.data.current as DragData | undefined;
  
  // Calculate snap preview
  const snappedStart = snap(zone.startTime);
  const defaultDuration = dragData?.source === 'backlog' ? 
    (60 * 60 * 1000) : // 1 hour default for new events
    dragData?.source === 'timegrid' ? 
      (dragData as any).originalEnd - (dragData as any).originalStart :
      (2 * 60 * 60 * 1000); // 2 hours default for all-day conversion
      
  const snappedEnd = snappedStart + defaultDuration;

  return (
    <div
      ref={setNodeRef}
      className={`
        absolute left-0 right-0 
        ${showPreview ? 'bg-blue-100 border-2 border-dashed border-blue-400' : ''}
        hover:bg-gray-50 transition-colors duration-150
      `}
      style={{ 
        top: `${zone.position}px`, 
        height: `${zone.height}px` 
      }}
      data-testid={`time-slot-${zone.id}`}
    >
      {/* Snap preview */}
      {showPreview && (
        <div
          className="absolute left-2 right-2 bg-blue-200 border border-blue-400 rounded opacity-75"
          style={{
            top: `${msToPosition(snappedStart) - zone.position}px`,
            height: `${msToPosition(snappedEnd) - msToPosition(snappedStart)}px`
          }}
        >
          <div className="p-2 text-xs text-blue-800 font-medium">
            {dragData?.event.title}
          </div>
        </div>
      )}
    </div>
  );
}