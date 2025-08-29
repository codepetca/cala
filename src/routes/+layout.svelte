<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.pcss';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-900">
	<div class="fixed top-0 left-0 right-0 z-50">
		<Navbar />
	</div>
	<main class="pt-12 pb-20">
		{@render children?.()}
	</main>
</div>
