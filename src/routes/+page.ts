export const load = async ({ url }) => {
	const sizeMode = url.searchParams.get('sizeMode');

	return {
		initialValue: url.searchParams.get('value') || '',
		fullScreen: url.searchParams.get('fullscreen') === 'true' || false,
		sizeMode: sizeMode === 'capped' ? 'capped' : 'largest'
	};
};
