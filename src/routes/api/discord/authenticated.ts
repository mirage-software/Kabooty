import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';

export interface IDiscordAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export const get: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');

	let token: string;

	try {
		const decoded = Jwt.decode(cookies['discord_token']);
		token = decoded['access_token'] as string;
	} catch (error) {
		return {
			status: 401
		};
	}

	if (!token) {
		return {
			body: {
				authenticated: false
			}
		};
	} else {
		return {
			body: {
				authenticated: true
			}
		};
	}
};
