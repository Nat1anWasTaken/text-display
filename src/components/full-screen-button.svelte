<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { Maximize } from '@lucide/svelte';

	let {
		class: className = '',
		fullscreen = $bindable(false)
	}: { class?: string; fullscreen?: boolean } = $props();

	function toggleFullScreen() {
		fullscreen = !fullscreen;
		if (fullscreen) {
			document.documentElement.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}
</script>

<Button
	size="icon"
	variant="outline"
	class={cn('cursor-pointer', className)}
	onclick={toggleFullScreen}
>
	<Maximize />
</Button>
