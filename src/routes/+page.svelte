<script lang="ts">
	import { onMount } from 'svelte';
	import AdaptiveInput from '../components/adaptive-input.svelte';
	import ColorModeButton from '../components/color-mode-button.svelte';
	import CopyUrlButton from '../components/copy-url-button.svelte';
	import FullScreenButton from '../components/full-screen-button.svelte';

	let { data } = $props();

	let value = $state(data.initialValue);
	let fullscreen = $state(data.fullScreen);

	$effect(() => {
		try {
			history.replaceState(
				null,
				'',
				`?value=${encodeURIComponent(value)}&fullscreen=${fullscreen}`
			);
		} catch (error) {
			console.error(error);
		}
	});

	onMount(() => {
		if (data.fullScreen) {
			window.document.documentElement.requestFullscreen();
		}
	});
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<AdaptiveInput bind:value />
	<div
		class="absolute top-5 right-5 flex flex-row gap-2 opacity-0 transition-opacity duration-200 hover:opacity-100"
	>
		<CopyUrlButton />
		<ColorModeButton />
		<FullScreenButton bind:fullscreen />
	</div>
</div>
