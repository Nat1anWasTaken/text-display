<script lang="ts">
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import * as Command from '$lib/components/ui/command';
	import * as Dialog from '$lib/components/ui/dialog';
	import { copyViewportAsImage } from '$lib/utils/copy-as-image';
	import {
		Copy,
		Image as ImageIcon,
		Maximize,
		MoonStar,
		QrCode,
		Scaling,
		Trash2,
		Type
	} from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';
	import { onMount, tick } from 'svelte';
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
	let commandPaletteOpen = $state(false);
	let mounted = $state(false);
	let controlsElement: HTMLDivElement | null = $state(null);

	function runCommand(command: () => void | Promise<void>) {
		commandPaletteOpen = false;
		void tick().then(command);
	}

	function copyUrl() {
		return navigator.clipboard.writeText(window.location.href);
	}

	async function toggleFullscreen() {
		if (document.fullscreenElement) {
			await document.exitFullscreen();
		} else {
			await document.documentElement.requestFullscreen();
		}
	}

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

		const handleKeydown = (event: KeyboardEvent) => {
			if (
				(event.metaKey || event.ctrlKey) &&
				event.shiftKey &&
				event.key.toLowerCase() === 'p'
			) {
				event.preventDefault();
				commandPaletteOpen = !commandPaletteOpen;
			}
		};

		window.addEventListener('keydown', handleKeydown);

		return () => window.removeEventListener('keydown', handleKeydown);
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

<Dialog.Root bind:open={commandPaletteOpen}>
	<Dialog.Content data-screenshot-excluded class="overflow-hidden p-0 sm:max-w-lg">
		<Dialog.Title class="sr-only">Command palette</Dialog.Title>
		<Dialog.Description class="sr-only">
			Search for an action to perform on the text display.
		</Dialog.Description>
		<Command.Root>
			<Command.Input placeholder="Type a command or search..." />
			<Command.List>
				<Command.Empty>No commands found.</Command.Empty>
				<Command.Group heading="View">
					<Command.Item
						keywords={['qr', 'qrcode', 'scan', 'code', 'text']}
						onSelect={() => runCommand(() => void (qrMode = !qrMode))}
					>
						{#if qrMode}<Type />{:else}<QrCode />{/if}
						<span>{qrMode ? 'Show text' : 'Show QR code'}</span>
					</Command.Item>
					<Command.Item
						keywords={['size', 'font', 'text', 'largest', 'capped', 'scale', 'resize']}
						onSelect={() =>
							runCommand(() => void (sizeMode = sizeMode === 'largest' ? 'capped' : 'largest'))}
					>
						<Scaling />
						<span>{sizeMode === 'largest' ? 'Use capped text size' : 'Use largest text size'}</span>
					</Command.Item>
					<Command.Item
						keywords={['dark', 'light', 'theme', 'mode', 'appearance', 'color']}
						onSelect={() => runCommand(toggleMode)}
					>
						<MoonStar />
						<span>Toggle color theme</span>
					</Command.Item>
					<Command.Item
						keywords={['fullscreen', 'full screen', 'maximize', 'expand', 'window']}
						onSelect={() => runCommand(toggleFullscreen)}
					>
						<Maximize />
						<span>{fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</span>
					</Command.Item>
				</Command.Group>
				<Command.Separator />
				<Command.Group heading="Share">
					<Command.Item
						keywords={['url', 'link', 'address', 'share', 'clipboard']}
						onSelect={() => runCommand(copyUrl)}
					>
						<Copy />
						<span>Copy URL</span>
					</Command.Item>
					<Command.Item
						keywords={['image', 'picture', 'screenshot', 'png', 'share', 'clipboard']}
						onSelect={() => runCommand(() => copyViewportAsImage())}
					>
						<ImageIcon />
						<span>Copy as image</span>
					</Command.Item>
				</Command.Group>
				<Command.Separator />
				<Command.Group heading="Edit">
					<Command.Item
						keywords={['clear', 'delete', 'erase', 'remove', 'reset', 'empty']}
						onSelect={() => runCommand(() => void (value = ''))}
					>
						<Trash2 />
						<span>Clear text</span>
					</Command.Item>
				</Command.Group>
			</Command.List>
			<div class="text-muted-foreground flex items-center justify-end border-t px-3 py-2 text-xs">
				<kbd class="bg-muted rounded px-1.5 py-0.5 font-mono">Cmd/Ctrl + Shift + P</kbd>
			</div>
		</Command.Root>
	</Dialog.Content>
</Dialog.Root>
