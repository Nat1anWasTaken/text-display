<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { copyViewportAsImage } from '$lib/utils/copy-as-image';
	import { Check, Image as ImageIcon } from '@lucide/svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

	let {
		class: className = '',
		hiddenElements = []
	}: { class?: string; hiddenElements?: HTMLElement[] } = $props();

	let copied = $state(false);
	let timeout: number | null = $state(null);

	async function copyAsImage() {
		if (timeout) {
			clearTimeout(timeout);
		}

		try {
			await copyViewportAsImage(hiddenElements);

			copied = true;
			timeout = setTimeout(() => (copied = false), 1000);
		} catch (err) {
			console.error('Copy as image failed:', err);
		}
	}
</script>

<Tooltip>
	<TooltipTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				size="icon"
				variant="outline"
				class={cn('cursor-pointer', className)}
				onclick={copyAsImage}
			>
				{#if copied}
					<Check class="animate-in fade-in-0 text-green-500 duration-100" />
				{:else}
					<ImageIcon class="animate-in fade-in-0 duration-100" />
				{/if}
			</Button>
		{/snippet}
	</TooltipTrigger>
	<TooltipContent side="bottom">Copy as image</TooltipContent>
</Tooltip>
