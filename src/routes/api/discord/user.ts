import type { RequestHandler } from '@sveltejs/kit';
import OAuth from 'discord-oauth2';
import { Env } from '../../../env';
import cookie from 'cookie';

export interface IDiscordAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export const get: RequestHandler = async ({ request }) => {
	let token;

	if (request.headers.has('cookie')) {
		const cookieHeader = request.headers.get('cookie');

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const cookies = cookie.parse(cookieHeader!);

		token = cookies['discord_token'];
	}

	if (!token) {
		return {
			status: 401
		};
	}

	const env = await Env.load();

	const client = new OAuth({
		clientId: env['DISCORD_CLIENT_ID'],
		clientSecret: env['DISCORD_CLIENT_SECRET']
	});

	try {
		const user = await client.getUser(token);

		// TODO: store user in database

		return {
			status: 200,
			body: JSON.stringify(user)
		};
	} catch (error) {
		return {
			status: 400,
			body: {
				error: 'Failed to get user'
			}
		};
	}
};
