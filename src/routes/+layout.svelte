<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster richColors />
<TooltipProvider>
	{@render children()}
</TooltipProvider>
