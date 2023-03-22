import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ cookies }) => {
	cookies.set('accepted', 'true', {
		path: '/'
	});

	return json({});
};
