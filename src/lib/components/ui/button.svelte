<script lang="ts">
  import { cn } from "$lib/utils.js";

  type $$Props = {
    variant?: 'default' | 'secondary' | 'destructive';
    size?: 'default' | 'sm' | 'lg';
    class?: string;
  };

  export let variant: $$Props["variant"] = "default";
  export let size: $$Props["size"] = "default";
  let className: $$Props["class"] = undefined;
  export { className as class };

  function getButtonClasses(variant: string, size: string) {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variantClasses = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
      destructive: "bg-red-600 text-white hover:bg-red-700"
    };
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6"
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  }
</script>

<button
  class={cn(getButtonClasses(variant, size), className)}
  type="button"
  {...$$restProps}
  on:click
  on:keydown
>
  <slot />
</button>