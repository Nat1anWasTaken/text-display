<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { Check, Copy } from '@lucide/svelte';

	let { class: className = '' }: { class?: string } = $props();
	let copied = $state(false);

	let timeout: number | null = $state(null);

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

<Button size="icon" variant="outline" class={cn('cursor-pointer', className)} onclick={copyUrl}>
	{#if copied}
		<Check class="animate-in fade-in-0 text-green-500 duration-100" />
	{:else}
		<Copy class="animate-in fade-in-0 duration-100" />
	{/if}
</Button>
