// Central theme configuration with consistent design tokens

export const theme = {
  // Border radius values for consistent rounding
  borderRadius: {
    sm: 'rounded-md',      // 6px - small elements like tags
    md: 'rounded-lg',      // 8px - buttons, inputs, cards (default)
    lg: 'rounded-xl',      // 12px - larger cards, modals
    full: 'rounded-full'   // Full rounding for circular elements
  },

  // Consistent spacing scale
  spacing: {
    xs: 'px-2 py-1',      // Very tight spacing
    sm: 'px-3 py-2',      // Input/button spacing
    md: 'px-4 py-3',      // Default spacing
    lg: 'px-6 py-4',      // Card content spacing
    xl: 'px-8 py-6'       // Modal spacing
  },

  // Color palette for minimal design
  colors: {
    primary: {
      bg: 'bg-blue-500 hover:bg-blue-600',
      text: 'text-blue-600 hover:text-blue-700',
      border: 'border-blue-500 hover:border-blue-600'
    },
    secondary: {
      bg: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
      text: 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
      border: 'border-gray-300 dark:border-gray-600'
    },
    destructive: {
      bg: 'bg-red-500 hover:bg-red-600',
      text: 'text-red-600 hover:text-red-700',
      border: 'border-red-500 hover:border-red-600'
    },
    ghost: {
      bg: 'hover:bg-gray-50 dark:hover:bg-gray-800',
      text: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
    }
  },

  // Input/form element styles
  input: {
    base: 'w-full rounded-lg border-0 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
    padding: 'px-4 py-3',
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed'
  },

  // Shadow styles (subtle for minimal design)
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    none: 'shadow-none'
  },

  // Typography consistency
  text: {
    heading: 'text-gray-900 dark:text-gray-100 font-medium',
    body: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    label: 'text-gray-800 dark:text-gray-200 font-medium'
  },

  // Transitions for smooth interactions
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out'
  }
} as const;

// Helper function to combine theme classes
export function getThemeClasses(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}