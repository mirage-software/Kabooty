import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	if (!locals.signedIn) {
		cookies.delete('discord_token');
		cookies.delete('user_id');
		throw redirect(307, `${base}/login`);
	}

	return;
};
