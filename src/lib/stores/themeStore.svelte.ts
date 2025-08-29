import { storageRepository, type ThemeMode } from '$lib/repositories/storageRepository';

/**
 * Theme store using Svelte 5 runes
 * Handles theme state, persistence, and DOM updates
 */
class ThemeStore {
  // Reactive state
  private themeMode = $state<ThemeMode>('system');
  
  // Computed reactive values using $derived
  isDarkMode = $derived((() => {
    if (this.themeMode === 'system') {
      return storageRepository.getSystemTheme() === 'dark';
    }
    return this.themeMode === 'dark';
  })());
  
  // Current theme for display purposes
  currentTheme = $derived(this.themeMode);

  constructor() {
    // Load initial theme
    this.themeMode = storageRepository.loadTheme();
    
    // Apply initial theme to DOM
    this.applyThemeToDOM();
    
    // Listen for system theme changes
    this.setupSystemThemeListener();
  }

  /**
   * Toggle between light and dark mode
   */
  toggle(): void {
    this.themeMode = this.isDarkMode ? 'light' : 'dark';
    this.persistAndApply();
  }

  /**
   * Set specific theme mode
   */
  setTheme(mode: ThemeMode): void {
    this.themeMode = mode;
    this.persistAndApply();
  }

  /**
   * Set to light mode
   */
  setLight(): void {
    this.setTheme('light');
  }

  /**
   * Set to dark mode
   */
  setDark(): void {
    this.setTheme('dark');
  }

  /**
   * Set to system preference
   */
  setSystem(): void {
    this.setTheme('system');
  }

  /**
   * Get theme mode options for UI
   */
  getThemeOptions(): Array<{ value: ThemeMode; label: string; icon: string }> {
    return [
      { value: 'light', label: 'Light', icon: '☀️' },
      { value: 'dark', label: 'Dark', icon: '🌙' },
      { value: 'system', label: 'System', icon: '💻' },
    ];
  }

  /**
   * Persist theme and apply to DOM
   */
  private persistAndApply(): void {
    storageRepository.saveTheme(this.themeMode);
    this.applyThemeToDOM();
  }

  /**
   * Apply current theme to DOM
   */
  private applyThemeToDOM(): void {
    storageRepository.applyTheme(this.isDarkMode);
  }

  /**
   * Listen for system theme changes when in system mode
   */
  private setupSystemThemeListener(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only update DOM if we're in system mode
      if (this.themeMode === 'system') {
        this.applyThemeToDOM();
      }
    };

    // Add listener for system theme changes
    mediaQuery.addEventListener('change', handleChange);
  }
}

// Export singleton instance
export const themeStore = new ThemeStore();