<script lang="ts">
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import AdaptiveInput from '../components/adaptive-input.svelte';
	import ColorModeButton from '../components/color-mode-button.svelte';
	import CopyImageButton from '../components/copy-image-button.svelte';
	import CopyUrlButton from '../components/copy-url-button.svelte';
	import FullScreenButton from '../components/full-screen-button.svelte';
	import QrCodeButton from '../components/qr-code-button.svelte';
	import QrCodeDisplay from '../components/qr-code-display.svelte';
	import TextSizeModeButton from '../components/text-size-mode-button.svelte';

	let { data } = $props();

	type TextSizeMode = 'largest' | 'capped';

	let value = $state(data.initialValue);
	let fullscreen = $state(data.fullScreen);
	let sizeMode: TextSizeMode = $state(data.sizeMode as TextSizeMode);
	let qrMode = $state(data.qrMode);
	let mounted = $state(false);
	let controlsElement: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (!mounted) return;

		try {
			replaceState(
				`?value=${encodeURIComponent(value)}&fullscreen=${fullscreen ? 1 : 0}&size=${sizeMode}&qr=${qrMode ? 1 : 0}`,
				page.state
			);
		} catch (error) {
			console.error(error);
		}
	});

	afterNavigate(() => {
		mounted = true;
	});

	onMount(() => {
		if (data.fullScreen) {
			window.document.documentElement.requestFullscreen();
		}
	});
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	{#if qrMode}
		<QrCodeDisplay {value} />
	{:else}
		<AdaptiveInput bind:value {sizeMode} />
	{/if}
	<div
		bind:this={controlsElement}
		data-screenshot-excluded
		class="absolute top-5 right-5 flex flex-row gap-2 opacity-0 transition-opacity duration-200 hover:opacity-100"
	>
		<CopyUrlButton />
		<CopyImageButton hiddenElements={controlsElement ? [controlsElement] : []} />
		<QrCodeButton bind:qrMode />
		<TextSizeModeButton bind:sizeMode />
		<ColorModeButton />
		<FullScreenButton bind:fullscreen />
	</div>
</div>
