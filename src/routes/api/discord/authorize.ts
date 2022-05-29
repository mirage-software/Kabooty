import type { RequestHandler } from '@sveltejs/kit';
import { DiscordOAuth } from './oauth';

export interface IDiscordAuthUrl extends Record<string, string> {
	url: string;
}

export const get: RequestHandler = async () => {
	return {
		body: <IDiscordAuthUrl>{
			url: DiscordOAuth.getAuthorizeUrl()
		}
	};
};
