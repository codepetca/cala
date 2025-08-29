<script lang="ts">
  interface Props {
    targetTime: Date;
    visible: boolean;
    hoveredTime?: Date;
  }

  let { targetTime, visible = false, hoveredTime }: Props = $props();

  // Generate time slots around the target time
  function generateTimeSlots(centerTime: Date): Date[] {
    const slots: Date[] = [];
    const centerHour = centerTime.getHours();
    const centerMinute = centerTime.getMinutes();
    
    // Start from 3 hours before, show 7 slots total
    const startTime = new Date(centerTime);
    startTime.setHours(centerHour - 3);
    startTime.setMinutes(centerMinute < 30 ? 0 : 30);
    
    for (let i = 0; i < 13; i++) { // Show more slots for better range
      const slot = new Date(startTime);
      slot.setMinutes(startTime.getMinutes() + (i * 30));
      
      // Only add slots within the same day
      if (slot.getDate() === centerTime.getDate()) {
        slots.push(slot);
      }
    }
    
    return slots;
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
  }

  function isTargetTime(slot: Date): boolean {
    return slot.getHours() === targetTime.getHours() && 
           slot.getMinutes() === targetTime.getMinutes();
  }

  function isHoveredTime(slot: Date): boolean {
    if (!hoveredTime) return false;
    return slot.getHours() === hoveredTime.getHours() && 
           slot.getMinutes() === hoveredTime.getMinutes();
  }

  let timeSlots = $derived(visible ? generateTimeSlots(targetTime) : []);
</script>

{#if visible}
  <div class="absolute left-0 top-0 bottom-0 w-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-r border-gray-200 dark:border-gray-700 flex flex-col justify-center z-20">
    {#each timeSlots as slot}
      <div 
        class="text-xs text-center py-1 transition-all"
        class:font-bold={isTargetTime(slot)}
        class:text-blue-600={isTargetTime(slot)}
        class:bg-blue-100={isHoveredTime(slot)}
        class:text-gray-500={!isTargetTime(slot) && !isHoveredTime(slot)}
      >
        {formatTime(slot)}
      </div>
    {/each}
  </div>
{/if}