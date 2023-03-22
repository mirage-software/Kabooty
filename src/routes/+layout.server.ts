import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ depends, cookies }) => {
	depends('app:cookies:notice');
	return {
		cookies_accepted: cookies.get('accepted') === 'true'
	};
};
