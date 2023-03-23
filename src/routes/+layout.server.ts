import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ depends, cookies, locals }) => {
	depends('app:cookies:notice');
	depends('app:auth:signedin');

	return {
		cookiesAccepted: cookies.get('accepted') === 'true',
		signedIn: locals.signedIn
	};
};
