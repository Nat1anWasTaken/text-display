<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	let { class: className = '', value = $bindable('') }: { class?: string; value?: string } =
		$props();

	let inputElement: HTMLInputElement | null = $state(null);

	const MIN_FONT_SIZE = 64;
	const MAX_FONT_SIZE_RATIO_1 = 0.1;
	const MAX_FONT_SIZE_RATIO_2 = 0.4;

	function adjustFontSize() {
		if (!inputElement) return;

		// Calculate the maximum font size
		const maxFontSize = Math.min(
			window.innerWidth * MAX_FONT_SIZE_RATIO_1,
			window.innerWidth * MAX_FONT_SIZE_RATIO_2
		);
		let fontSize = Math.max(maxFontSize, MIN_FONT_SIZE);

		inputElement.style.fontSize = fontSize + 'px';

		// Decrease the font size until the content fits in the input box
		while (inputElement.scrollWidth > inputElement.clientWidth && fontSize > 16) {
			fontSize -= 1;
			inputElement.style.fontSize = fontSize + 'px';
		}
	}

	onMount(() => {
		adjustFontSize();

		if (inputElement) {
			inputElement.focus();
		}
	});
</script>

<input
	bind:this={inputElement}
	bind:value
	type="text"
	class={cn('w-full border-none p-4 text-center focus:outline-none', className)}
	oninput={adjustFontSize}
	onresize={adjustFontSize}
/>
