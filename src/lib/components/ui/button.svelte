<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { theme } from "$lib/theme.js";

  interface Props {
    variant?: 'default' | 'secondary' | 'destructive' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    class?: string;
    onclick?: () => void;
  }

  let { variant = "default", size = "default", class: className, onclick, ...restProps }: Props = $props();

  function getButtonClasses(variant: string, size: string) {
    const baseClasses = `inline-flex items-center justify-center ${theme.borderRadius.md} font-medium ${theme.transition.fast} focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none`;
    
    const variantClasses = {
      default: `${theme.colors.primary.bg} text-white`,
      secondary: `${theme.colors.secondary.bg} ${theme.colors.secondary.text}`,
      destructive: `${theme.colors.destructive.bg} text-white`,
      ghost: `${theme.colors.ghost.bg} ${theme.colors.ghost.text}`
    };
    
    const sizeClasses = {
      default: `h-10 ${theme.spacing.sm}`,
      sm: `h-8 px-3 py-1 text-sm`,
      lg: `h-12 ${theme.spacing.md}`,
      icon: "h-10 w-10"
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  }
</script>

<button
  class={cn(getButtonClasses(variant, size), className)}
  type="button"
  {...restProps}
  {onclick}
>
  <slot />
</button>