import type { Trip } from '$lib/schemas';

/**
 * Trip-related utility functions
 */

/**
 * Get all days between trip start and end date (inclusive)
 */
export function getTripDays(trip: Trip): Date[] {
  const days: Date[] = [];
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  
  // Ensure we're working with date-only values
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    days.push(new Date(current));
  }
  
  return days;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${weekday} ${month} ${day}`;
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format a datetime for input fields (YYYY-MM-DDTHH:MM)
 */
export function formatDateTimeForInput(date: Date): string {
  return date.toISOString().slice(0, 16);
}

/**
 * Get trip duration in days
 */
export function getTripDuration(trip: Trip): number {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
}

/**
 * Check if a date falls within the trip date range
 */
export function isDateInTrip(date: Date, trip: Trip): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const startDate = new Date(trip.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(trip.endDate);
  endDate.setHours(0, 0, 0, 0);
  
  return checkDate >= startDate && checkDate <= endDate;
}