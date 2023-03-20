import type { RequestHandler } from '@sveltejs/kit';
import { DiscordOAuth } from './oauth';

export interface IDiscordAuthUrl extends Record<string, string> {
	url: string;
}

export const GET: RequestHandler = async () => {
	return {
		body: <IDiscordAuthUrl>{
			url: DiscordOAuth.getAuthorizeUrl()
		}
	};
};
