<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { theme } from "$lib/theme.js";

  interface Props {
    value?: string;
    required?: boolean;
    disabled?: boolean;
    class?: string;
    id?: string;
    name?: string;
  }

  let { 
    value = "", 
    required = false, 
    disabled = false,
    class: className,
    id,
    name,
    ...restProps 
  }: Props = $props();

  const selectClasses = cn(
    theme.input.base,
    theme.input.padding,
    theme.input.focus,
    theme.input.disabled,
    theme.transition.fast,
    className
  );
</script>

<select
  {id}
  {name}
  bind:value
  {required}
  {disabled}
  class={selectClasses}
  {...restProps}
>
  <slot />
</select>