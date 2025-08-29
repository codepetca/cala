<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { theme } from "$lib/theme.js";

  interface Props {
    for?: string;
    required?: boolean;
    class?: string;
  }

  let { 
    for: htmlFor, 
    required = false,
    class: className,
    ...restProps 
  }: Props = $props();

  const labelClasses = cn(
    "block text-sm mb-2",
    theme.text.label,
    className
  );
</script>

<label
  for={htmlFor}
  class={labelClasses}
  {...restProps}
>
  <slot />
  {#if required}
    <span class="text-red-500 ml-1">*</span>
  {/if}
</label>