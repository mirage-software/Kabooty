import { json, type RequestHandler } from '@sveltejs/kit';
import { DiscordOAuth } from '../oauth/+server';

export interface IDiscordAuthUrl extends Record<string, string> {
	url: string;
}

export const GET: RequestHandler = async () => {
	return json(<IDiscordAuthUrl>{
		url: DiscordOAuth.getAuthorizeUrl()
	});
};
