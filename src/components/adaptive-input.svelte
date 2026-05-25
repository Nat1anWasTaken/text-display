<script lang="ts">
	import { cn } from '$lib/utils';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import { EditorState, RangeSetBuilder } from '@codemirror/state';
	import {
		Decoration,
		EditorView,
		keymap,
		ViewPlugin,
		type DecorationSet,
		type ViewUpdate
	} from '@codemirror/view';
	import { onMount, tick } from 'svelte';

	type TextSizeMode = 'largest' | 'capped';

	let {
		class: className = '',
		value = $bindable(''),
		sizeMode = 'largest'
	}: { class?: string; value?: string; sizeMode?: TextSizeMode } = $props();

	let editorHost: HTMLDivElement | null = $state(null);
	let view: EditorView | null = null;
	let syncingFromEditor = false;

	const MIN_FONT_SIZE = 1;
	const HARD_MAX_FONT_SIZE = 10000;
	const CAPPED_MIN_FONT_SIZE = 16;
	const CAPPED_DEFAULT_FONT_SIZE = 200;
	const CAPPED_MAX_FONT_SIZE_RATIO_1 = 0.1;
	const CAPPED_MAX_FONT_SIZE_RATIO_2 = 0.4;
	const LINE_HEIGHT = 1.2;
	const FIT_TOLERANCE = 0.5;

	type PendingDecoration = {
		from: number;
		to: number;
		decoration: Decoration;
	};

	const hiddenMarkdown = Decoration.replace({});
	const strongMarkdown = Decoration.mark({ class: 'cm-md-strong' });
	const emphasisMarkdown = Decoration.mark({ class: 'cm-md-emphasis' });
	const codeMarkdown = Decoration.mark({ class: 'cm-md-code' });
	const strikeMarkdown = Decoration.mark({ class: 'cm-md-strike' });
	const headingMarkdown = Decoration.mark({ class: 'cm-md-heading' });
	const quoteMarkdown = Decoration.mark({ class: 'cm-md-quote' });

	const markdownPreview = ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(editorView: EditorView) {
				this.decorations = buildMarkdownDecorations(editorView);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = buildMarkdownDecorations(update.view);
				}
			}
		},
		{
			decorations: (plugin) => plugin.decorations
		}
	);

	const editorTheme = EditorView.theme({
		'&': {
			width: '100%',
			background: 'transparent',
			color: 'inherit',
			fontFamily: 'inherit'
		},
		'&.cm-focused': {
			outline: 'none'
		},
		'.cm-scroller': {
			overflow: 'auto hidden',
			fontFamily: 'inherit',
			lineHeight: String(LINE_HEIGHT)
		},
		'.cm-content': {
			padding: '1rem',
			textAlign: 'center',
			whiteSpace: 'pre',
			caretColor: 'currentColor'
		},
		'.cm-line': {
			padding: '0',
			lineHeight: String(LINE_HEIGHT)
		},
		'.cm-md-strong': {
			fontWeight: '700'
		},
		'.cm-md-emphasis': {
			fontStyle: 'italic'
		},
		'.cm-md-code': {
			fontFamily: 'inherit'
		},
		'.cm-md-strike': {
			textDecoration: 'line-through'
		},
		'.cm-md-heading': {
			fontWeight: '700'
		},
		'.cm-md-quote': {
			borderLeft: '0.08em solid currentColor',
			paddingLeft: '0.35em'
		},
		'.cm-selectionBackground': {
			backgroundColor: 'color-mix(in oklab, currentColor 18%, transparent) !important'
		}
	});

	function rangesOverlap(from: number, to: number, occupiedRanges: Array<[number, number]>) {
		return occupiedRanges.some(
			([occupiedFrom, occupiedTo]) => from < occupiedTo && to > occupiedFrom
		);
	}

	function addInlineDecoration(
		pendingDecorations: PendingDecoration[],
		occupiedRanges: Array<[number, number]>,
		lineStart: number,
		match: RegExpExecArray,
		markerLength: number,
		decoration: Decoration
	) {
		const from = lineStart + match.index;
		const to = from + match[0].length;
		if (match[0].length <= markerLength * 2 || rangesOverlap(from, to, occupiedRanges)) return;

		pendingDecorations.push(
			{ from, to: from + markerLength, decoration: hiddenMarkdown },
			{ from: to - markerLength, to, decoration: hiddenMarkdown },
			{ from: from + markerLength, to: to - markerLength, decoration }
		);
		occupiedRanges.push([from, to]);
	}

	function buildMarkdownDecorations(editorView: EditorView) {
		const pendingDecorations: PendingDecoration[] = [];

		for (const { from, to } of editorView.visibleRanges) {
			const startLine = editorView.state.doc.lineAt(from);
			const endLine = editorView.state.doc.lineAt(to);

			for (let lineNumber = startLine.number; lineNumber <= endLine.number; lineNumber += 1) {
				const line = editorView.state.doc.line(lineNumber);
				const text = line.text;
				const occupiedRanges: Array<[number, number]> = [];

				const headingMatch = /^(#{1,6})\s+/.exec(text);
				if (headingMatch) {
					const markerTo = line.from + headingMatch[0].length;
					pendingDecorations.push(
						{ from: line.from, to: markerTo, decoration: hiddenMarkdown },
						{ from: markerTo, to: line.to, decoration: headingMarkdown }
					);
					occupiedRanges.push([line.from, markerTo]);
				}

				const quoteMatch = /^>\s?/.exec(text);
				if (quoteMatch) {
					const markerTo = line.from + quoteMatch[0].length;
					pendingDecorations.push(
						{ from: line.from, to: markerTo, decoration: hiddenMarkdown },
						{ from: markerTo, to: line.to, decoration: quoteMarkdown }
					);
					occupiedRanges.push([line.from, markerTo]);
				}

				for (const match of text.matchAll(/(`+)([^`]+?)\1/g)) {
					addInlineDecoration(
						pendingDecorations,
						occupiedRanges,
						line.from,
						match,
						match[1].length,
						codeMarkdown
					);
				}

				for (const match of text.matchAll(/(\*\*|__)(\S(?:.*?\S)?)\1/g)) {
					addInlineDecoration(
						pendingDecorations,
						occupiedRanges,
						line.from,
						match,
						match[1].length,
						strongMarkdown
					);
				}

				for (const match of text.matchAll(/~~(\S(?:.*?\S)?)~~/g)) {
					addInlineDecoration(
						pendingDecorations,
						occupiedRanges,
						line.from,
						match,
						2,
						strikeMarkdown
					);
				}

				for (const match of text.matchAll(/(?<!\*)\*(?!\*)(\S(?:.*?\S)?)\*(?!\*)/g)) {
					addInlineDecoration(
						pendingDecorations,
						occupiedRanges,
						line.from,
						match,
						1,
						emphasisMarkdown
					);
				}

				for (const match of text.matchAll(
					/(?<![\p{L}\p{N}_])_(\S(?:.*?\S)?)_(?![\p{L}\p{N}_])/gu
				)) {
					addInlineDecoration(
						pendingDecorations,
						occupiedRanges,
						line.from,
						match,
						1,
						emphasisMarkdown
					);
				}
			}
		}

		pendingDecorations.sort((a, b) => a.from - b.from || a.to - b.to);

		const builder = new RangeSetBuilder<Decoration>();
		for (const { from, to, decoration } of pendingDecorations) {
			if (from < to) builder.add(from, to, decoration);
		}

		return builder.finish();
	}

	function setFontSize(fontSize: number) {
		if (!view?.dom) return;
		view.dom.style.fontSize = fontSize + 'px';
	}

	function editorContentElement() {
		return editorHost?.querySelector<HTMLElement>('.cm-content') ?? null;
	}

	function fitsViewport(fontSize: number) {
		const contentElement = editorContentElement();
		if (!contentElement || !editorHost) return true;

		setFontSize(fontSize);
		view?.requestMeasure();

		return (
			contentElement.scrollWidth <= editorHost.clientWidth + FIT_TOLERANCE &&
			contentElement.scrollHeight <= window.innerHeight + FIT_TOLERANCE
		);
	}

	function adjustFontSize() {
		if (!view || !editorHost) return;

		const lineCount = Math.max(view.state.doc.lines, 1);
		const heightLimitedFontSize = window.innerHeight / (lineCount * LINE_HEIGHT);
		const maxFontSize =
			sizeMode === 'capped'
				? Math.min(
						window.innerWidth * CAPPED_MAX_FONT_SIZE_RATIO_1,
						window.innerWidth * CAPPED_MAX_FONT_SIZE_RATIO_2,
						CAPPED_DEFAULT_FONT_SIZE
					)
				: HARD_MAX_FONT_SIZE;
		const minFontSize = sizeMode === 'capped' ? CAPPED_MIN_FONT_SIZE : MIN_FONT_SIZE;
		let lowerBound = minFontSize;
		let upperBound = Math.min(Math.max(heightLimitedFontSize, minFontSize), maxFontSize);

		if (!fitsViewport(lowerBound)) {
			setFontSize(lowerBound);
			return;
		}

		for (let step = 0; step < 16; step += 1) {
			const midpoint = (lowerBound + upperBound) / 2;

			if (fitsViewport(midpoint)) {
				lowerBound = midpoint;
			} else {
				upperBound = midpoint;
			}
		}

		setFontSize(lowerBound);
		view.requestMeasure();
	}

	async function refreshLayout() {
		await tick();
		adjustFontSize();
	}

	function syncEditorValue(nextValue: string) {
		if (!view || view.state.doc.toString() === nextValue) return;

		view.dispatch({
			changes: { from: 0, to: view.state.doc.length, insert: nextValue }
		});
	}

	$effect(() => {
		if (!syncingFromEditor) syncEditorValue(value);
		refreshLayout();
	});

	$effect(() => {
		sizeMode;
		refreshLayout();
	});

	onMount(() => {
		if (!editorHost) return;

		view = new EditorView({
			parent: editorHost,
			state: EditorState.create({
				doc: value,
				extensions: [
					history(),
					keymap.of([...defaultKeymap, ...historyKeymap]),
					markdownPreview,
					editorTheme,
					EditorView.updateListener.of((update) => {
						if (!update.docChanged) return;

						syncingFromEditor = true;
						value = update.state.doc.toString();
						syncingFromEditor = false;
						refreshLayout();
					})
				]
			})
		});

		refreshLayout();
		view.focus();

		const handleResize = () => {
			adjustFontSize();
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			view?.destroy();
			view = null;
		};
	});
</script>

<div bind:this={editorHost} class={cn('w-full', className)} aria-label="Display text"></div>
