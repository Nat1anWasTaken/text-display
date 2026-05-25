<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { Maximize } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

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

	const tooltipText = $derived(fullscreen ? 'Exit fullscreen' : 'Enter fullscreen');

	onMount(() => {
		document.addEventListener('fullscreenchange', () => {
			fullscreen = document.fullscreenElement !== null;
		});

		return () => {
			document.removeEventListener('fullscreenchange', () => {
				fullscreen = document.fullscreenElement !== null;
			});
		};
	});
</script>

<Tooltip>
	<TooltipTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				size="icon"
				variant="outline"
				class={cn('cursor-pointer', className)}
				onclick={toggleFullScreen}
			>
				<Maximize />
			</Button>
		{/snippet}
	</TooltipTrigger>
	<TooltipContent side="bottom">{tooltipText}</TooltipContent>
</Tooltip>
