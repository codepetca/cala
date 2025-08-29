/**
 * Device detection and responsive utilities
 */

// Breakpoint constants matching Tailwind defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Check if the current device is likely a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet'];
  const hasMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Check for touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen width
  const isNarrowScreen = window.innerWidth < BREAKPOINTS.lg;
  
  return hasMobileUA || (hasTouch && isNarrowScreen);
}

/**
 * Check if screen width is below a specific breakpoint
 */
export function isBelowBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS[breakpoint];
}

/**
 * Get the current screen size category
 */
export function getScreenSize(): keyof typeof BREAKPOINTS | 'xs' {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Create a reactive screen size store for Svelte
 */
export function createScreenSizeStore() {
  let screenSize = $state(getScreenSize());
  let isMobile = $state(isMobileDevice());
  
  if (typeof window !== 'undefined') {
    const updateSize = () => {
      screenSize = getScreenSize();
      isMobile = isMobileDevice();
    };
    
    window.addEventListener('resize', updateSize);
    
    // Cleanup function
    return {
      get screenSize() { return screenSize; },
      get isMobile() { return isMobile; },
      destroy() {
        window.removeEventListener('resize', updateSize);
      }
    };
  }
  
  return {
    get screenSize() { return screenSize; },
    get isMobile() { return isMobile; },
    destroy() {}
  };
}