export const load = async ({ url }) => {
	return {
		initialValue: url.searchParams.get('value') || '',
		fullScreen: url.searchParams.get('fullscreen') === 'true' || false
	};
};
