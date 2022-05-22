import type { RequestHandler } from '@sveltejs/kit';
import OAuth from 'discord-oauth2';
import { Env } from '../../../env';

export interface IDiscordUser {
	username: string;
	discriminator: string;
	avatar_url: string;
	token: string;
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
				error: 'Missing Discord code'
			}
		};
	}

	const token = await client.tokenRequest({
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		code: code!,
		grantType: 'authorization_code',
		scope: ['identify', 'guilds', 'guilds.join']
	});

	console.log(token);

	return {
		body: {
			passed: true
		}
	};
};
