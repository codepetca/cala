import { browser } from '$app/environment';
import { safeParseTripArray, type Trip } from '$lib/schemas';

/**
 * Repository pattern for localStorage operations
 * Handles serialization, deserialization, and error handling
 */

const STORAGE_KEYS = {
  TRIPS: 'cala-trips',
  THEME: 'cala-theme',
  USER_PREFERENCES: 'cala-preferences',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Generic storage operations
 */
class StorageRepository {
  /**
   * Check if we're in a browser environment
   */
  private get isClient(): boolean {
    return browser && typeof localStorage !== 'undefined';
  }

  /**
   * Safely get an item from localStorage
   */
  private getItem(key: string): string | null {
    if (!this.isClient) return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to read from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Safely set an item in localStorage
   */
  private setItem(key: string, value: string): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to write to localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Load and parse trips from localStorage
   */
  loadTrips(): Trip[] {
    const stored = this.getItem(STORAGE_KEYS.TRIPS);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      
      // Parse dates properly during deserialization
      const withDates = this.parseDatesInTripsArray(parsed);
      
      // Validate with Zod
      const result = safeParseTripArray(withDates);
      
      if (result.success) {
        return result.data;
      } else {
        console.error('Invalid trip data in localStorage:', result.error.issues);
        return [];
      }
    } catch (error) {
      console.error('Failed to parse trips from localStorage:', error);
      return [];
    }
  }

  /**
   * Save trips to localStorage
   */
  saveTrips(trips: Trip[]): boolean {
    try {
      const serialized = JSON.stringify(trips);
      return this.setItem(STORAGE_KEYS.TRIPS, serialized);
    } catch (error) {
      console.error('Failed to serialize trips:', error);
      return false;
    }
  }

  /**
   * Load theme preference
   */
  loadTheme(): ThemeMode {
    const stored = this.getItem(STORAGE_KEYS.THEME);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  /**
   * Save theme preference
   */
  saveTheme(theme: ThemeMode): boolean {
    return this.setItem(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Get system color scheme preference
   */
  getSystemTheme(): 'light' | 'dark' {
    if (!this.isClient) return 'light';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Apply theme to document
   */
  applyTheme(isDark: boolean): void {
    if (!this.isClient) return;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  /**
   * Clear all storage (useful for development/testing)
   */
  clearAll(): void {
    if (!this.isClient) return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
      }
    });
  }

  /**
   * Parse ISO date strings back to Date objects in trips array
   * This handles the serialization round-trip for dates
   */
  private parseDatesInTripsArray(trips: any[]): any[] {
    if (!Array.isArray(trips)) return [];
    
    return trips.map(trip => ({
      ...trip,
      startDate: trip.startDate ? new Date(trip.startDate) : undefined,
      endDate: trip.endDate ? new Date(trip.endDate) : undefined,
      events: Array.isArray(trip.events) ? trip.events.map((event: any) => ({
        ...event,
        start: event.start ? new Date(event.start) : undefined,
        end: event.end ? new Date(event.end) : undefined,
      })) : []
    }));
  }
}

// Export singleton instance
export const storageRepository = new StorageRepository();