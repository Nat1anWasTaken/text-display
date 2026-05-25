<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<TooltipProvider>
	{@render children()}
</TooltipProvider>
