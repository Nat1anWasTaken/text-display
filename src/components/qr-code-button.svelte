<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import { QrCode, Type } from '@lucide/svelte';

	let { class: className = '', qrMode = $bindable(false) }: { class?: string; qrMode?: boolean } =
		$props();

	const tooltipText = $derived(qrMode ? 'Show text' : 'Show QR code');
</script>

<Tooltip>
	<TooltipTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				size="icon"
				variant="outline"
				class={cn('cursor-pointer', className)}
				onclick={() => (qrMode = !qrMode)}
				aria-label={tooltipText}
				aria-pressed={qrMode}
			>
				{#if qrMode}
					<Type class="animate-in fade-in-0 duration-100" />
				{:else}
					<QrCode class="animate-in fade-in-0 duration-100" />
				{/if}
			</Button>
		{/snippet}
	</TooltipTrigger>
	<TooltipContent side="bottom">{tooltipText}</TooltipContent>
</Tooltip>
