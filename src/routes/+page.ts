export const load = async ({ url }) => {
	const sizeMode = url.searchParams.get('size') ?? url.searchParams.get('sizeMode');
	const isEnabled = (value: string | null) => value === '1' || value === 'true';

	return {
		initialValue: url.searchParams.get('value') || '',
		fullScreen: isEnabled(url.searchParams.get('fullscreen')),
		sizeMode: sizeMode === 'capped' ? 'capped' : 'largest',
		qrMode: isEnabled(url.searchParams.get('qr'))
	};
};
