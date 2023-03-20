import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import OAuth from 'discord-oauth2';
import { Env } from '../../../../env';
import cookie from 'cookie';
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

		if (!access_token) {
			return new Response(undefined, { status: 403 });
		}

		const env = Env.load();

		if (
			!env['DISCORD_CLIENT_ID'] ||
			!env['DISCORD_CLIENT_SECRET'] ||
			!env['DISCORD_SERVER_ID'] ||
			!env['DISCORD_BOT_TOKEN']
		) {
			return new Response(undefined, { status: 500 });
		}

		const client = new OAuth({
			clientId: env['DISCORD_CLIENT_ID'],
			clientSecret: env['DISCORD_CLIENT_SECRET']
		});

		const user = await client.getUser(access_token);

		client.addMember({
			accessToken: access_token,
			guildId: env['DISCORD_SERVER_ID'],
			botToken: env['DISCORD_BOT_TOKEN'],
			userId: user.id
		});

		return new Response(undefined);
	} catch (error) {
		SentryClient.log(error);

		return json({
			error: 'Failed to join the Discord'
		}, {
			status: 400
		});
	}
};
