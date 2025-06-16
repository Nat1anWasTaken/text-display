export const load = async ({ url }) => {
	return {
		initialValue: url.searchParams.get('value') || ''
	};
};
