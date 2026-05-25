<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { Scaling, Type } from '@lucide/svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

	type TextSizeMode = 'largest' | 'capped';

	let {
		class: className = '',
		sizeMode = $bindable('largest')
	}: { class?: string; sizeMode?: TextSizeMode } = $props();

	function toggleSizeMode() {
		sizeMode = sizeMode === 'largest' ? 'capped' : 'largest';
	}

	const tooltipText = $derived(sizeMode === 'largest' ? 'Largest text size' : 'Capped text size');
	const ariaLabel = $derived(
		sizeMode === 'largest' ? 'Switch to capped text mode' : 'Switch to largest text mode'
	);
</script>

<Tooltip>
	<TooltipTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				size="icon"
				variant="outline"
				class={cn('cursor-pointer', className)}
				onclick={toggleSizeMode}
				aria-label={ariaLabel}
			>
				{#if sizeMode === 'largest'}
					<Scaling class="animate-in fade-in-0 duration-100" />
				{:else}
					<Type class="animate-in fade-in-0 duration-100" />
				{/if}
			</Button>
		{/snippet}
	</TooltipTrigger>
	<TooltipContent side="bottom">{tooltipText}</TooltipContent>
</Tooltip>
