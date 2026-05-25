import { domToBlob } from 'modern-screenshot';

const SCREENSHOT_HIDDEN_ATTRIBUTE = 'data-screenshot-hidden';
const SCREENSHOT_EXCLUDED_ATTRIBUTE = 'data-screenshot-excluded';

async function nextFrame(): Promise<void> {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function writeBlobToClipboard(blob: Blob): Promise<void> {
	const item = new ClipboardItem({ 'image/png': blob });
	await navigator.clipboard.write([item]);
}

function screenshotExcludedElements(hiddenElements: HTMLElement[]): HTMLElement[] {
	return Array.from(
		new Set([
			...hiddenElements,
			...document.querySelectorAll<HTMLElement>(`[${SCREENSHOT_EXCLUDED_ATTRIBUTE}]`)
		])
	);
}

function shouldIncludeNode(node: Node, excludedElements: HTMLElement[]): boolean {
	return !excludedElements.some((element) => node === element || element.contains(node));
}

async function captureViewport(excludedElements: HTMLElement[]): Promise<Blob> {
	return await domToBlob(document.documentElement, {
		width: window.innerWidth,
		height: window.innerHeight,
		scale: window.devicePixelRatio,
		backgroundColor: getComputedStyle(document.body).backgroundColor,
		filter: (node) => shouldIncludeNode(node, excludedElements),
		style: {
			width: `${window.innerWidth}px`,
			height: `${window.innerHeight}px`,
			overflow: 'hidden'
		}
	});
}

export async function copyViewportAsImage(hiddenElements: HTMLElement[] = []): Promise<void> {
	const excludedElements = screenshotExcludedElements(hiddenElements);
	const changedElements = excludedElements.filter(
		(element) => !element.hasAttribute(SCREENSHOT_HIDDEN_ATTRIBUTE)
	);

	for (const element of changedElements) {
		element.setAttribute(SCREENSHOT_HIDDEN_ATTRIBUTE, '');
	}

	try {
		await nextFrame();
		const blob = await captureViewport(excludedElements);
		await writeBlobToClipboard(blob);
	} finally {
		for (const element of changedElements) {
			element.removeAttribute(SCREENSHOT_HIDDEN_ATTRIBUTE);
		}
	}
}
