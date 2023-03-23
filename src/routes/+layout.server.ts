import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ depends, cookies }) => {
	depends('app:cookies:notice');

	if (!cookies.get('accepted')) {
		return;
	}

	return {
		cookies_accepted: cookies.get('accepted') === 'true'
	};
};
