<script lang="ts">
	import { mode } from 'mode-watcher';

	let { value }: { value: string } = $props();

	let dataUrl = $state('');
	let errorMessage = $state('');
	let generation = 0;

	$effect(() => {
		const text = value;
		const darkMode = mode.current === 'dark';
		const currentGeneration = ++generation;

		if (!text) {
			dataUrl = '';
			errorMessage = '';
			return;
		}

		import('qrcode')
			.then(({ toDataURL }) =>
				toDataURL(text, {
					errorCorrectionLevel: 'M',
					margin: 4,
					width: 1200,
					color: {
						dark: darkMode ? '#f8fafcff' : '#0f172aff',
						light: '#00000000'
					}
				})
			)
			.then((url) => {
				if (currentGeneration !== generation) return;
				dataUrl = url;
				errorMessage = '';
			})
			.catch((error: unknown) => {
				if (currentGeneration !== generation) return;
				console.error('QR code generation failed:', error);
				dataUrl = '';
				errorMessage = 'This text is too long to fit in a QR code.';
			});
	});
</script>

<div class="flex h-full w-full items-center justify-center p-6" aria-live="polite">
	{#if dataUrl}
		<img
			src={dataUrl}
			alt="QR code containing the displayed text"
			class="bg-background max-h-[min(90vh,90vw)] max-w-[min(90vh,90vw)] rounded-sm"
		/>
	{:else if errorMessage}
		<p class="text-muted-foreground text-center text-lg">{errorMessage}</p>
	{:else}
		<p class="text-muted-foreground text-center text-lg">Enter some text to create a QR code.</p>
	{/if}
</div>
