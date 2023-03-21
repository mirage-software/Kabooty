import { json, type RequestHandler } from '@sveltejs/kit';
import type { IAuthDiscordUrlResponse } from './interfaces';
import { DiscordOAuth } from './oauth';

export const GET: RequestHandler = async () => {
	return json(<IAuthDiscordUrlResponse>{
		url: DiscordOAuth.getAuthorizeUrl()
	});
};
