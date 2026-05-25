<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import { Scaling, Type } from '@lucide/svelte';

	type TextSizeMode = 'largest' | 'capped';

	let {
		class: className = '',
		sizeMode = $bindable('largest')
	}: { class?: string; sizeMode?: TextSizeMode } = $props();

	function toggleSizeMode() {
		sizeMode = sizeMode === 'largest' ? 'capped' : 'largest';
	}
</script>

<Button
	size="icon"
	variant="outline"
	class={cn('cursor-pointer', className)}
	onclick={toggleSizeMode}
	title={sizeMode === 'largest' ? 'Largest text mode' : 'Capped text mode'}
	aria-label={sizeMode === 'largest' ? 'Switch to capped text mode' : 'Switch to largest text mode'}
>
	{#if sizeMode === 'largest'}
		<Scaling class="animate-in fade-in-0 duration-100" />
	{:else}
		<Type class="animate-in fade-in-0 duration-100" />
	{/if}
</Button>
