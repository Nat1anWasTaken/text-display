const FONT_FAMILY = `system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`;
const MIN_FONT = 16;
const DEFAULT_FONT = 200;
const MAX_RATIO_1 = 0.1;
const MAX_RATIO_2 = 0.4;
const PADDING_RATIO = 0.05;

type Theme = 'light' | 'dark';

function getViewportSize(): { width: number; height: number } {
	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}

function detectTheme(): Theme {
	return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function calculateFontSize(
	ctx: CanvasRenderingContext2D,
	lines: string[],
	width: number,
	height: number,
	padding: number
): { fontSize: number; lineHeight: number } {
	let fontSize = Math.max(
		Math.min(width * MAX_RATIO_1, width * MAX_RATIO_2, DEFAULT_FONT),
		MIN_FONT
	);

	const measure = (size: number) => {
		ctx.font = `${size}px ${FONT_FAMILY}`;
		const metrics = lines.map((line) => ctx.measureText(line));
		const maxWidth = Math.max(1, ...metrics.map((m) => m.width));
		const lineHeight = Math.ceil(size * 1.2);
		const totalHeight = lines.length * lineHeight;
		return { maxWidth, lineHeight, totalHeight };
	};

	while (fontSize > MIN_FONT) {
		const { maxWidth, totalHeight } = measure(fontSize);
		if (maxWidth <= width - 2 * padding && totalHeight <= height - 2 * padding) {
			const lineHeight = Math.ceil(fontSize * 1.2);
			return { fontSize, lineHeight };
		}
		fontSize -= 1;
	}

	const lineHeight = Math.ceil(fontSize * 1.2);
	return { fontSize, lineHeight };
}

function drawText(
	ctx: CanvasRenderingContext2D,
	lines: string[],
	fontSize: number,
	lineHeight: number,
	width: number,
	height: number,
	theme: Theme
) {
	ctx.font = `${fontSize}px ${FONT_FAMILY}`;
	ctx.fillStyle = theme === 'dark' ? '#e5e5e5' : '#111827';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	const totalHeight = lines.length * lineHeight;
	let y = Math.round(height / 2 - totalHeight / 2 + lineHeight / 2);
	const x = Math.round(width / 2);
	for (const line of lines) {
		ctx.fillText(line, x, y);
		y += lineHeight;
	}
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob((value) => resolve(value), 'image/png')
	);
	if (!blob) throw new Error('Failed generating image');
	return blob;
}

async function writeBlobToClipboard(blob: Blob): Promise<void> {
	const item = new ClipboardItem({ 'image/png': blob });
	await navigator.clipboard.write([item]);
}

export async function copyValueAsImage(value: string): Promise<void> {
	const { width, height } = getViewportSize();
	const padding = Math.round(Math.min(width, height) * PADDING_RATIO);
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas not supported');

	const theme = detectTheme();
	ctx.fillStyle = theme === 'dark' ? '#0a0a0a' : '#ffffff';
	ctx.fillRect(0, 0, width, height);

	const lines = (value ?? '').split('\n');
	const { fontSize, lineHeight } = calculateFontSize(ctx, lines, width, height, padding);

	drawText(ctx, lines, fontSize, lineHeight, width, height, theme);

	const blob = await canvasToBlob(canvas);
	await writeBlobToClipboard(blob);
}
