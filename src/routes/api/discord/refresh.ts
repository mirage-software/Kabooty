import type { RequestHandler } from '@sveltejs/kit';
import OAuth from 'discord-oauth2';
import { Env } from '../../../env';

export interface IDiscordAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export const get: RequestHandler = async ({ request }) => {
	const env = await Env.load();

	const client = new OAuth({
		clientId: env['DISCORD_CLIENT_ID'],
		clientSecret: env['DISCORD_CLIENT_SECRET']
	});

	const code = request.headers.get('Authorization');

	if (!code) {
		return {
			status: 400,
			body: {
				error: 'Missing Discord refresh token'
			}
		};
	}

	const token = await client.tokenRequest({
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		refreshToken: code!,
		grantType: 'refresh_token',
		scope: ['identify', 'guilds', 'guilds.join']
	});

	return {
		body: <IDiscordAccessToken>token
	};
};
