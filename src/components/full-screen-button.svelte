<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { Maximize } from '@lucide/svelte';

	let { class: className = '' }: { class?: string } = $props();

	function toggleFullScreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
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
