/**
 * Centralized store exports
 * Clean API for importing stores throughout the application
 */

// Store instances
export { tripStore } from './tripStore.svelte';
export { themeStore } from './themeStore.svelte';

// Re-export types for convenience
export type { Trip, Event, Family, EventType } from '$lib/schemas';
export type { ThemeMode } from '$lib/repositories/storageRepository';