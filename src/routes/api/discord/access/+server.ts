import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import OAuth from 'discord-oauth2';
import { Env } from '../../../../env';
import cookie from 'cookie';
import { dev } from '$app/environment';
import { Jwt } from '../../../../jwt';
import { SentryClient } from '../../../../bot/sentry';

export interface IDiscordAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export const GET: RequestHandler = async ({ request }) => {
	try {
		const cookieHeader = request.headers.get('cookie');
		const cookies = cookie.parse(cookieHeader ?? '');
		const decoded = Jwt.decode(cookies['discord_token']);
		const access_token = decoded['access_token'] as string;

		if (access_token) {
			return new Response(undefined);
		}

		const env = Env.load();

		const client = new OAuth({
			clientId: env['DISCORD_CLIENT_ID'],
			clientSecret: env['DISCORD_CLIENT_SECRET']
		});

		const code = request.headers.get('Authorization');

		if (!code || code.length === 0) {
			throw new Error('Missing authorization code');
		}

		const token = await client.tokenRequest({
			code: code ?? '',
			grantType: 'authorization_code',
			redirectUri: env['DISCORD_REDIRECT_URI'],
			clientId: env['DISCORD_CLIENT_ID'],
			clientSecret: env['DISCORD_CLIENT_SECRET'],
			scope: ['identify', 'guilds', 'guilds.join']
		});

		const user = await client.getUser(token.access_token);

		const discordTokenCookie = cookie.serialize(
			'discord_token',
			Jwt.encode({ access_token: token.access_token }),
			{
				expires: new Date(Date.now() + (token.expires_in - 5000) * 1000),
				httpOnly: true,
				sameSite: 'lax',
				secure: !dev,
				path: '/api/'
			}
		);

		const userIdCookie = cookie.serialize('user_id', Jwt.encode({ user_id: user.id }), {
			expires: new Date(Date.now() + (token.expires_in - 5000) * 1000),
			httpOnly: true,
			sameSite: 'lax', // !! same-site 'lax' has poor standards, and varies per browser
			secure: !dev,
			path: '/api/'
		});

		const headers = new Headers();

		headers.append('Set-Cookie', discordTokenCookie);
		headers.append('Set-Cookie', userIdCookie);

		return new Response(undefined, { headers: headers });
	} catch (error) {
		SentryClient.log(error);

		return json(
			{
				error: 'Failed to authenticate with Discord'
			},
			{
				status: 400
			}
		);
	}
};
