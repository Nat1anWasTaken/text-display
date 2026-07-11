<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { Check, Copy } from '@lucide/svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

	let { class: className = '' }: { class?: string } = $props();
	let copied = $state(false);

	let timeout: ReturnType<typeof setTimeout> | null = $state(null);

	function copyUrl() {
		if (timeout) {
			clearTimeout(timeout);
		}

		navigator.clipboard.writeText(window.location.href).then(() => {
			copied = true;

			timeout = setTimeout(() => {
				copied = false;
			}, 1000);
		});
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
				onclick={copyUrl}
			>
				{#if copied}
					<Check class="animate-in fade-in-0 text-green-500 duration-100" />
				{:else}
					<Copy class="animate-in fade-in-0 duration-100" />
				{/if}
			</Button>
		{/snippet}
	</TooltipTrigger>
	<TooltipContent side="bottom">Copy URL</TooltipContent>
</Tooltip>
