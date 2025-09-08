/**
 * Time math utilities for WeekBoard positioning and snapping
 */

export const HOUR_HEIGHT = 60; // pixels per hour
export const DEFAULT_SNAP_MINUTES = 30;
export const FINE_SNAP_MINUTES = 5;
export const START_HOUR = 8; // 8 AM
export const END_HOUR = 20; // 8 PM
export const TOTAL_HOURS = END_HOUR - START_HOUR;

/**
 * Convert milliseconds since epoch to time slot (30min increments)
 */
export function msToSlot(ms: number): number {
  const date = new Date(ms);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return (hours - START_HOUR) * 2 + Math.floor(minutes / 30);
}

/**
 * Convert time slot back to milliseconds for a given date
 */
export function slotToMs(slot: number, baseDate: Date): number {
  const hours = START_HOUR + Math.floor(slot / 2);
  const minutes = (slot % 2) * 30;
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result.getTime();
}

/**
 * Snap milliseconds to grid intervals (30min default, 5min with alt key)
 */
export function snap(ms: number, useAltSnap = false): number {
  const snapMinutes = useAltSnap ? FINE_SNAP_MINUTES : DEFAULT_SNAP_MINUTES;
  const date = new Date(ms);
  const minutes = date.getMinutes();
  const snappedMinutes = Math.round(minutes / snapMinutes) * snapMinutes;
  
  const result = new Date(date);
  result.setMinutes(snappedMinutes, 0, 0);
  return result.getTime();
}

/**
 * Calculate top position in pixels for a given time
 */
export function msToPosition(ms: number): number {
  const date = new Date(ms);
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  if (hour < START_HOUR) return 0;
  if (hour >= END_HOUR) return TOTAL_HOURS * HOUR_HEIGHT;
  
  const hourOffset = hour - START_HOUR;
  const minuteOffset = minute / 60;
  return (hourOffset + minuteOffset) * HOUR_HEIGHT;
}

/**
 * Calculate milliseconds from pixel position and base date
 */
export function positionToMs(position: number, baseDate: Date): number {
  const totalHours = position / HOUR_HEIGHT;
  const hour = START_HOUR + Math.floor(totalHours);
  const minute = Math.round((totalHours % 1) * 60);
  
  const result = new Date(baseDate);
  result.setHours(hour, minute, 0, 0);
  return result.getTime();
}

/**
 * Calculate height in pixels for a duration in milliseconds
 */
export function durationToHeight(durationMs: number): number {
  return (durationMs / (1000 * 60 * 60)) * HOUR_HEIGHT;
}

/**
 * Get hour lines for the time grid
 */
export function getHourLines(): Array<{ hour: number; label: string; position: number }> {
  const lines = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const position = (hour - START_HOUR) * HOUR_HEIGHT;
    const label = hour === 12 ? '12 PM' : 
                 hour < 12 ? `${hour} AM` : 
                 hour === 24 ? '12 AM' : `${hour - 12} PM`;
    lines.push({ hour, label, position });
  }
  return lines;
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: number, end1: number,
  start2: number, end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Get current time position for "now" indicator
 */
export function getCurrentTimePosition(): number | null {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < START_HOUR || hour >= END_HOUR) return null;
  
  return msToPosition(now.getTime());
}

/**
 * Format time for display (e.g., "9:30 AM")
 */
export function formatTime(ms: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(ms));
}

/**
 * Format date for display (e.g., "Mon, Jan 15")
 */
export function formatDate(ms: number): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(ms));
}