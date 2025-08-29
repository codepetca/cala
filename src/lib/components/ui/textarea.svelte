<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { theme } from "$lib/theme.js";

  interface Props {
    value?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
    class?: string;
    id?: string;
    name?: string;
  }

  let { 
    value = "", 
    placeholder, 
    required = false, 
    disabled = false,
    rows = 3,
    class: className,
    id,
    name,
    ...restProps 
  }: Props = $props();

  const textareaClasses = cn(
    theme.input.base,
    theme.input.padding,
    theme.input.focus,
    theme.input.disabled,
    theme.transition.fast,
    "resize-none",
    className
  );
</script>

<textarea
  {id}
  {name}
  bind:value
  {placeholder}
  {required}
  {disabled}
  {rows}
  class={textareaClasses}
  {...restProps}
></textarea>