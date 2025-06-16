<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	let { class: className = '', value = $bindable('') }: { class?: string; value?: string } =
		$props();

	let textareaElement: HTMLTextAreaElement | null = $state(null);

	const MIN_FONT_SIZE = 16;
	const DEFAULT_FONT_SIZE = 200;
	const MAX_FONT_SIZE_RATIO_1 = 0.1;
	const MAX_FONT_SIZE_RATIO_2 = 0.4;

	function adjustFontSize() {
		if (!textareaElement) return;

		// Calculate the maximum font size
		const maxFontSize = Math.min(
			window.innerWidth * MAX_FONT_SIZE_RATIO_1,
			window.innerWidth * MAX_FONT_SIZE_RATIO_2,
			DEFAULT_FONT_SIZE
		);
		let fontSize = Math.max(maxFontSize, MIN_FONT_SIZE);

		textareaElement.style.fontSize = fontSize + 'px';

		// Decrease the font size until the content fits in the textarea horizontally
		while (textareaElement.scrollWidth > textareaElement.clientWidth && fontSize > MIN_FONT_SIZE) {
			fontSize -= 1;
			textareaElement.style.fontSize = fontSize + 'px';
		}
	}

	function autoResize() {
		if (!textareaElement) return;
		textareaElement.style.height = 'auto';
		textareaElement.style.height = textareaElement.scrollHeight + 'px';
	}

	function handleInput() {
		autoResize();
		adjustFontSize();
	}

	onMount(() => {
		autoResize();
		adjustFontSize();

		if (textareaElement) {
			textareaElement.focus();
		}

		window.addEventListener('resize', () => {
			autoResize();
			adjustFontSize();
		});
	});
</script>

<textarea
	bind:this={textareaElement}
	bind:value
	class={cn('w-full resize-none border-none p-4 text-center focus:outline-none', className)}
	oninput={handleInput}
	rows="1"
	wrap={null}
	style="overflow-x:auto; overflow-y:hidden; white-space:pre; resize:none;"
></textarea>
