<script lang="ts">
  import type { Event, Family } from '$lib/schema.js';
  import { cn } from '$lib/utils.js';

  interface Props {
    event: Event;
    family?: Family;
    class?: string;
    onclick?: (event: Event) => void;
  }

  let { event, family, class: className, onclick }: Props = $props();

  // Event type icons - simple SVG strings
  const typeIcons: Record<string, string> = {
    stay: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>`,
    activity: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    meal: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/></svg>`,
    transport: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10V6c0-2-2-2-2-2H8c0 0-2 0-2 2v4l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
    note: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>`
  };

  function handleClick() {
    onclick?.(event);
  }

  function formatTime(date: Date | undefined): string {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
  }
</script>

<div
  class={cn(
    "px-3 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded drag-item",
    className
  )}
  onclick={handleClick}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  <div class="flex items-center gap-2">
    {#if event.start}
      <div style="transform: scale(0.8); transform-origin: left center;" class="text-xs text-gray-400 font-mono flex-shrink-0 leading-none">
        {formatTime(event.start)}
      </div>
    {/if}
    
    <div class="text-gray-500 flex-shrink-0">
      {@html typeIcons[event.type] || typeIcons.note}
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate leading-tight">
        {event.title}
      </div>
      
      {#if event.details || family}
        <div style="transform: scale(0.9); transform-origin: left center;" class="text-xs text-gray-400 truncate leading-tight">
          {#if family}
            <span class="inline-block w-1 h-1 rounded-full mr-0.5" style="background-color: {family.color}"></span>
            {family.name}
            {#if event.details} · {/if}
          {/if}
          {#if event.details}{event.details}{/if}
        </div>
      {/if}
    </div>
  </div>
</div>