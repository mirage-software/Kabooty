import type { IAuthDiscordUrlResponse } from '../../../../../Documents/Mirage/kabooty/src/routes/api/auth/discord/url/interfaces';
import type { LayoutLoad } from './$types';
import type { IAuthOsuUrlResponse } from './api/auth/osu/url/interfaces';

export const prerender = false;

export const load: LayoutLoad = async ({ fetch, depends, data }) => {
	const requests = await Promise.all([fetch('/api/auth/discord/url'), fetch('/api/auth/osu/url')]);
	depends('app:auth:discord:url');
	depends('app:auth:osu:url');
	return {
		auth: {
			discord: {
				url: (<IAuthDiscordUrlResponse>await requests[0].json()).url
			},
			osu: {
				url: (<IAuthOsuUrlResponse>await requests[1].json()).url
			}
		},
		cookies_accepted: data?.cookies_accepted
	};
};
