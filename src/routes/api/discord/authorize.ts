import type { RequestHandler } from '@sveltejs/kit';
import OAuth from 'discord-oauth2';
import { Env } from '../../../env';

export interface IDiscordAuthUrl extends Record<string, string> {
	url: string;
}

export const get: RequestHandler = async () => {
	const client = new OAuth();

	const env = await Env.load();

	const url = client.generateAuthUrl({
		scope: ['identify', 'guilds', 'guilds.join'],
		clientId: env['DISCORD_CLIENT_ID'],
		redirectUri: env['DISCORD_REDIRECT_URI'],
		responseType: 'code'
	});

	return {
		body: <IDiscordAuthUrl>{
			url: url
		}
	};
};
