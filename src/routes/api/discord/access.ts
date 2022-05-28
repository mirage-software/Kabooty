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
	if (request.headers.has('cookie')) {
		const cookieHeader = request.headers.get('cookie');

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const cookies = cookie.parse(cookieHeader!);

		if (cookies['discord_token']) {
			return {
				status: 200
			};
		}
	}

	const env = await Env.load();

	const client = new OAuth({
		clientId: env['DISCORD_CLIENT_ID'],
		clientSecret: env['DISCORD_CLIENT_SECRET']
	});

	const code = request.headers.get('Authorization');

	if (!code || code.length === 0) {
		return {
			status: 400,
			body: {
				error: 'Missing Discord code'
			}
		};
	}

	try {
		const token = await client.tokenRequest({
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			code: code!,
			grantType: 'authorization_code',
			redirectUri: env['DISCORD_REDIRECT_URI'],
			clientId: env['DISCORD_CLIENT_ID'],
			clientSecret: env['DISCORD_CLIENT_SECRET'],
			scope: ['identify', 'guilds', 'guilds.join']
		});

		const setCookie = cookie.serialize('discord_token', token.access_token, {
			expires: new Date(Date.now() + (token.expires_in - 5000) * 1000),
			httpOnly: true,
			sameSite: 'strict',
			secure: parseInt(env['PRODUCTION'] ?? '0') === 1
		});

		return {
			headers: {
				'Set-Cookie': setCookie
			}
		};
	} catch (error) {
		return {
			status: 400,
			body: {
				error: 'Failed to authenticate with Discord'
			}
		};
	}
};
