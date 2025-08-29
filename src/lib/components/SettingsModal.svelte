<script lang="ts">
  import Button from '$lib/components/ui/button.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';

  interface Props {
    open: boolean;
    onclose?: () => void;
  }

  let { open, onclose }: Props = $props();

  function handleClose() {
    onclose?.();
  }
</script>

{#if open}
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={handleClose}
    role="button"
    tabindex="-1"
  >
    <!-- Modal content -->
    <div 
      class="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">Settings</h2>
          <button
            type="button"
            onclick={handleClose}
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close settings"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Theme Setting -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium">Theme</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose your preferred theme</p>
            </div>
            <ThemeToggle />
          </div>

          <!-- Other settings can be added here -->
          <div class="border-t pt-6">
            <h3 class="text-sm font-medium mb-2">About</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Cala - Trip Planning App
            </p>
          </div>
        </div>

        <!-- Close button -->
        <div class="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <Button onclick={handleClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}