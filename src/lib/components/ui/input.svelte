<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { theme } from "$lib/theme.js";

  interface Props {
    type?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    class?: string;
    id?: string;
    name?: string;
  }

  let { 
    type = "text", 
    value = "", 
    placeholder, 
    required = false, 
    disabled = false,
    class: className,
    id,
    name,
    ...restProps 
  }: Props = $props();

  const inputClasses = cn(
    theme.input.base,
    theme.input.padding,
    theme.input.focus,
    theme.input.disabled,
    theme.transition.fast,
    className
  );
</script>

<input
  {id}
  {name}
  {type}
  bind:value
  {placeholder}
  {required}
  {disabled}
  class={inputClasses}
  {...restProps}
/>