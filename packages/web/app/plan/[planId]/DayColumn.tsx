'use client';

import { useMemo } from 'react';
import type { AllDayEvent, TimedEvent } from '@trip-planner/domain';
import { AllDayLane } from './AllDayLane';
import { TimeGrid } from './TimeGrid';
import { formatDate } from './timeMath';

interface DayColumnProps {
  date: string; // YYYY-MM-DD
  allDayEvents: AllDayEvent[];
  timedEvents: TimedEvent[];
  onAllDayEdit?: (event: AllDayEvent) => void;
  onAllDayClick?: (event: AllDayEvent) => void;
  onTimedEdit?: (event: TimedEvent) => void;
  onTimedClick?: (event: TimedEvent) => void;
  onEventResize?: (eventId: string, newStart: number, newEnd: number) => void;
  onAddAllDay?: () => void;
  onAddTimed?: () => void;
  className?: string;
}

export function DayColumn({ 
  date, 
  allDayEvents, 
  timedEvents,
  onAllDayEdit,
  onAllDayClick,
  onTimedEdit,
  onTimedClick,
  onEventResize,
  onAddAllDay,
  onAddTimed,
  className = '' 
}: DayColumnProps) {
  // Format date for header display
  const { dayName, monthDay, isToday } = useMemo(() => {
    const dateObj = new Date(date + 'T00:00:00');
    const today = new Date();
    
    return {
      dayName: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj),
      monthDay: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(dateObj),
      isToday: dateObj.toDateString() === today.toDateString()
    };
  }, [date]);

  // Calculate overflow for all-day events
  const maxAllDayVisible = 3;
  const allDayOverflowCount = Math.max(0, allDayEvents.length - maxAllDayVisible);

  return (
    <div 
      className={`flex flex-col h-full border-r border-gray-200 last:border-r-0 ${className}`}
      data-testid={`day-column-${date}`}
    >
      {/* Day Header */}
      <div className={`
        sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200 p-3
        ${isToday ? 'bg-blue-50/80 border-blue-200' : ''}
      `}>
        <div className="text-center">
          <div className={`
            text-sm font-medium
            ${isToday ? 'text-blue-700' : 'text-gray-600'}
          `}>
            {dayName}
          </div>
          <div className={`
            text-lg font-semibold mt-1
            ${isToday ? 'text-blue-900 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900'}
          `}>
            {monthDay.split(' ')[1]} {/* Just the day number */}
          </div>
        </div>

        {/* Quick add buttons */}
        <div className="mt-2 flex gap-1">
          {onAddAllDay && (
            <button
              onClick={onAddAllDay}
              className="flex-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors"
              data-testid={`quick-add-allday-${date}`}
            >
              + All Day
            </button>
          )}
          {onAddTimed && (
            <button
              onClick={onAddTimed}
              className="flex-1 text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
              data-testid={`quick-add-timed-${date}`}
            >
              + Timed
            </button>
          )}
        </div>

        {/* Today indicator */}
        {isToday && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* All-Day Lane */}
      <AllDayLane
        date={date}
        events={allDayEvents}
        maxVisible={maxAllDayVisible}
        onEdit={onAllDayEdit}
        onClick={onAllDayClick}
        onAdd={onAddAllDay}
        className="flex-shrink-0"
      />

      {/* Time Grid */}
      <div className="flex-1 relative overflow-hidden">
        <TimeGrid
          date={date}
          events={timedEvents}
          onEventEdit={onTimedEdit}
          onEventClick={onTimedClick}
          onEventResize={onEventResize}
        />
      </div>

      {/* Event count indicator at bottom */}
      {(allDayEvents.length > 0 || timedEvents.length > 0) && (
        <div className="border-t border-gray-100 px-2 py-1 text-xs text-gray-500 text-center bg-gray-50">
          {allDayEvents.length + timedEvents.length} events
          {allDayOverflowCount > 0 && (
            <span className="text-purple-600 font-medium">
              {' '}(+{allDayOverflowCount} hidden)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Simplified day header for smaller screens or compact mode
export function CompactDayColumn({ 
  date, 
  allDayEvents, 
  timedEvents,
  onClick,
  className = '' 
}: {
  date: string;
  allDayEvents: AllDayEvent[];
  timedEvents: TimedEvent[];
  onClick?: () => void;
  className?: string;
}) {
  const { dayName, monthDay, isToday } = useMemo(() => {
    const dateObj = new Date(date + 'T00:00:00');
    const today = new Date();
    
    return {
      dayName: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj),
      monthDay: new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(dateObj),
      isToday: dateObj.toDateString() === today.toDateString()
    };
  }, [date]);

  const totalEvents = allDayEvents.length + timedEvents.length;

  return (
    <div 
      className={`
        p-3 border-r border-gray-200 last:border-r-0 cursor-pointer
        hover:bg-gray-50 transition-colors
        ${isToday ? 'bg-blue-50 border-blue-200' : ''}
        ${className}
      `}
      onClick={onClick}
      data-testid={`compact-day-${date}`}
    >
      <div className="text-center">
        <div className={`
          text-sm font-medium mb-1
          ${isToday ? 'text-blue-700' : 'text-gray-600'}
        `}>
          {dayName}
        </div>
        <div className={`
          text-lg font-semibold
          ${isToday ? 'text-blue-900' : 'text-gray-900'}
        `}>
          {monthDay}
        </div>
        
        {totalEvents > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {totalEvents} event{totalEvents !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}